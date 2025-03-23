import React, { useState, useEffect } from 'react';
import { FileText, Music, Video, Image, File as FileIcon, Trash, Edit, Download, Plus, Search, Upload, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadFileToStorage } from '../../lib/supabase';
import { convertFileToBase64, formatFileSize } from '../../services/bookService';

// Test log to verify console logging is working
console.log('TEST LOG: AdminMaterialsPage component is loaded');

// Function to ensure the materials bucket exists
async function ensureMaterialsBucketExists() {
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'materials');
    
    if (!bucketExists) {
      console.log("Materials bucket doesn't exist, creating it now...");
      
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket('materials', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating materials bucket:', createError);
        return false;
      }
      
      console.log('Materials bucket created successfully');
      
      // Set up public access policy for the bucket
      const { error: policyError } = await supabase
        .storage
        .from('materials')
        .createSignedUrl('dummy.txt', 1); // This is just to check if we have access
      
      if (policyError) {
        console.log('Setting up public access policy for materials bucket...');
        
        // Create a SQL policy for public access (this requires admin rights)
        // Note: This might not work if the user doesn't have admin rights
        // In that case, you'll need to set up the policy in the Supabase dashboard
        console.log('Please ensure the following SQL policy is set up in your Supabase dashboard:');
        console.log(`
          CREATE POLICY "Public Access" 
          ON storage.objects 
          FOR ALL 
          USING (bucket_id = 'materials')
          WITH CHECK (bucket_id = 'materials');
        `);
      }
      
      return true;
    }
    
    return true;
  } catch (error: unknown) {
    console.error('Error in ensureMaterialsBucketExists:', error);
    return false;
  }
}

interface Material {
  id: string;
  book_id: string;
  bookTitle?: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize: string;
  contentUrl?: string;
  thumbnailUrl?: string;
}

const AdminMaterialsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form state for new material upload
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'pdf',
    file: null as File | null,
    contentUrl: '',
    contentFile: null as File | null,
    thumbnailUrl: '',
    thumbnailFile: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Edit material state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editContentFile, setEditContentFile] = useState<File | null>(null);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  
  // Test state for debugging
  const [testResult, setTestResult] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Custom debug logger that shows in UI
  const debugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formattedMessage = data 
      ? `${timestamp} - ${message}: ${JSON.stringify(data, null, 2)}`
      : `${timestamp} - ${message}`;
    
    setDebugLogs(prev => [...prev, formattedMessage]);
    
    // Also try normal console log
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      debugLog('Component mounted, checking materials bucket');
      ensureMaterialsBucketExists().then(success => {
        if (success) {
          debugLog('Materials bucket is ready for uploads');
        } else {
          debugLog('Failed to ensure materials bucket exists');
        }
      });
      loadData();
    }
  }, [isAuthenticated]);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title');
      
      if (booksError) throw booksError;
      setAllBooks(booksData || []);
      
      // Load materials with book title
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select(`
          *,
          books:book_id (title)
        `);
      
      if (materialsError) throw materialsError;
      
      // Format the materials with book title
      const formattedMaterials = (materialsData || []).map((material: any) => ({
        ...material,
        bookTitle: material.books?.title || 'Unknown Book',
        fileUrl: material.fileurl,
        fileSize: material.filesize
      }));
      
      setMaterials(formattedMaterials);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      setError((err as Error).message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from UI
      setMaterials(materials.filter(material => material.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material');
    }
  };
  
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    if (!selectedBook) {
      alert('Please select a book');
      return;
    }
    
    if (!newMaterial.title || !newMaterial.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!newMaterial.file && !newMaterial.file?.name) {
      alert('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      debugLog('[MATERIAL_UPLOAD] Starting material upload process', {
        bookId: selectedBook,
        materialTitle: newMaterial.title,
        materialType: newMaterial.type,
        fileName: newMaterial.file?.name,
        fileType: newMaterial.file?.type,
        fileSize: newMaterial.file?.size,
        hasContentFile: !!newMaterial.contentFile,
        hasThumbnailFile: !!newMaterial.thumbnailFile
      });
      
      // Ensure the materials bucket exists before uploading
      debugLog('[MATERIAL_UPLOAD] Ensuring materials bucket exists');
      const bucketReady = await ensureMaterialsBucketExists();
      if (!bucketReady) {
        debugLog('[MATERIAL_UPLOAD] Failed to ensure materials bucket exists');
        throw new Error('Failed to ensure materials bucket exists');
      }
      debugLog('[MATERIAL_UPLOAD] Materials bucket is ready');
      
      let fileUrl = '';
      let fileSize = '';
      let contentUrl = newMaterial.contentUrl;
      let thumbnailUrl = newMaterial.thumbnailUrl;
      
      // Handle file upload based on type
      if (newMaterial.file) {
        try {
          // Convert image files to base64, upload other files to Supabase Storage
          if (newMaterial.type === 'image' && newMaterial.file.type.startsWith('image/')) {
            debugLog('[MATERIAL_UPLOAD] Converting image file to base64');
            const base64Data = await convertFileToBase64(newMaterial.file);
            fileUrl = base64Data;
            debugLog('[MATERIAL_UPLOAD] Image file converted to base64 successfully');
          } else {
            // For non-image files, upload to Supabase Storage
            debugLog('[MATERIAL_UPLOAD] Preparing to upload non-image file to Supabase Storage:', {
              fileName: newMaterial.file.name,
              fileType: newMaterial.file.type,
              fileSize: newMaterial.file.size
            });
            
            try {
              // Use the uploadFileToStorage function from supabase.ts
              debugLog('[MATERIAL_UPLOAD] Calling uploadFileToStorage function');
              const publicUrl = await uploadFileToStorage(newMaterial.file, 'materials');
              fileUrl = publicUrl;
              debugLog('[MATERIAL_UPLOAD] File successfully uploaded to Supabase Storage:', publicUrl);
              
              // Verify the file exists in storage
              try {
                debugLog('[MATERIAL_UPLOAD] Verifying file exists in materials bucket');
                const { data: fileList, error: listError } = await supabase.storage
                  .from('materials')
                  .list();
                
                if (listError) {
                  debugLog('[MATERIAL_UPLOAD] Error listing files in materials bucket:', listError);
                } else {
                  debugLog('[MATERIAL_UPLOAD] Files in materials bucket:', fileList);
                  
                  // Check if our file is in the list
                  const fileExists = fileList.some(f => publicUrl.includes(f.name));
                  debugLog('[MATERIAL_UPLOAD] File exists in bucket:', fileExists);
                  
                  if (!fileExists) {
                    debugLog('[MATERIAL_UPLOAD] File not found in bucket after upload. URL may be incorrect or file not uploaded properly.');
                  }
                }
              } catch (verifyError: unknown) {
                debugLog('[MATERIAL_UPLOAD] Error verifying file in storage:', verifyError);
              }
            } catch (storageError: unknown) {
              debugLog('[MATERIAL_UPLOAD] Supabase Storage upload failed:', storageError);
              throw new Error(`Failed to upload to Supabase Storage: ${(storageError as Error).message || 'Unknown error'}`);
            }
          }
          
          fileSize = formatFileSize(newMaterial.file.size);
        } catch (uploadErr: unknown) {
          debugLog('[MATERIAL_UPLOAD] Error processing file:', uploadErr);
          setUploadError((uploadErr as Error).message || 'Error processing file. Using file name as reference.');
          
          // Fallback to using the file name as a reference
          if (newMaterial.file) {
            fileUrl = `/downloads/${newMaterial.file.name}`;
            fileSize = formatFileSize(newMaterial.file.size);
            debugLog('[MATERIAL_UPLOAD] Using fallback file reference:', fileUrl);
          }
        }
      }
      
      // Handle content file upload if provided
      if (newMaterial.contentFile) {
        try {
          debugLog('[MATERIAL_UPLOAD] Preparing to upload content file to Supabase Storage:', {
            fileName: newMaterial.contentFile.name,
            fileType: newMaterial.contentFile.type,
            fileSize: newMaterial.contentFile.size
          });
          
          // Use the uploadFileToStorage function from supabase.ts
          const contentPublicUrl = await uploadFileToStorage(newMaterial.contentFile, 'materials');
          contentUrl = contentPublicUrl;
          debugLog('[MATERIAL_UPLOAD] Content file successfully uploaded to Supabase Storage:', contentPublicUrl);
        } catch (contentUploadErr: unknown) {
          debugLog('[MATERIAL_UPLOAD] Error uploading content file:', contentUploadErr);
          alert(`Failed to upload content file: ${(contentUploadErr as Error).message || 'Unknown error'}`);
          // Continue with the process, just use the text URL if provided
        }
      }
      
      // Handle thumbnail file upload if provided
      if (newMaterial.thumbnailFile) {
        try {
          debugLog('[MATERIAL_UPLOAD] Preparing to upload thumbnail file to Supabase Storage:', {
            fileName: newMaterial.thumbnailFile.name,
            fileType: newMaterial.thumbnailFile.type,
            fileSize: newMaterial.thumbnailFile.size
          });
          
          // For thumbnails, prefer the 'covers' bucket as it's meant for images
          const thumbnailPublicUrl = await uploadFileToStorage(newMaterial.thumbnailFile, 'covers');
          thumbnailUrl = thumbnailPublicUrl;
          debugLog('[MATERIAL_UPLOAD] Thumbnail file successfully uploaded to Supabase Storage:', thumbnailPublicUrl);
        } catch (thumbnailUploadErr: unknown) {
          debugLog('[MATERIAL_UPLOAD] Error uploading thumbnail file:', thumbnailUploadErr);
          alert(`Failed to upload thumbnail file: ${(thumbnailUploadErr as Error).message || 'Unknown error'}`);
          // Continue with the process, just use the text URL if provided
        }
      }
      
      // Save the material to the database
      debugLog('[MATERIAL_UPLOAD] Saving material to database', {
        bookId: selectedBook,
        title: newMaterial.title,
        type: newMaterial.type,
        fileUrl,
        fileSize,
        contentUrl,
        thumbnailUrl
      });
      
      const { data, error } = await supabase
        .from('materials')
        .insert({
          book_id: selectedBook,
          title: newMaterial.title,
          description: newMaterial.description,
          type: newMaterial.type,
          fileurl: fileUrl, // Using snake_case for the database field
          filesize: fileSize, // Using snake_case for the database field
          contenturl: contentUrl || '', // Using snake_case for the database field
          thumbnailurl: thumbnailUrl || '' // Using snake_case for the database field
        })
        .select();
      
      if (error) {
        debugLog('[MATERIAL_UPLOAD] Database insert error:', error);
        throw error;
      }
      
      debugLog('[MATERIAL_UPLOAD] Material saved to database successfully:', data);
      
      // Update UI
      const bookTitle = allBooks.find(book => book.id === selectedBook)?.title || 'Unknown Book';
      if (data && data[0]) {
        setMaterials([
          ...materials,
          {
            ...data[0],
            bookTitle,
            fileUrl: data[0].fileurl,
            fileSize: data[0].filesize,
            contentUrl: data[0].contenturl,
            thumbnailUrl: data[0].thumbnailurl
          }
        ]);
        debugLog('[MATERIAL_UPLOAD] UI updated with new material');
      }
      
      // Reset form and close modal
      setNewMaterial({
        title: '',
        description: '',
        type: 'pdf',
        file: null,
        contentUrl: '',
        contentFile: null,
        thumbnailUrl: '',
        thumbnailFile: null
      });
      setSelectedBook('');
      setUploadModalOpen(false);
      debugLog('[MATERIAL_UPLOAD] Material upload process completed successfully');
    } catch (err: unknown) {
      debugLog('[MATERIAL_UPLOAD] Error uploading material:', err);
      alert('Failed to upload material: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setEditModalOpen(true);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMaterial) return;
    
    try {
      setIsUploading(true);
      debugLog('[MATERIAL_UPDATE] Starting material update process', {
        materialId: editingMaterial.id,
        materialTitle: editingMaterial.title,
        materialType: editingMaterial.type,
        hasNewFile: !!editFile,
        fileName: editFile?.name,
        fileType: editFile?.type,
        fileSize: editFile?.size,
        hasNewContentFile: !!editContentFile,
        hasNewThumbnailFile: !!editThumbnailFile
      });
      
      // Ensure the materials bucket exists before uploading
      debugLog('[MATERIAL_UPDATE] Ensuring materials bucket exists');
      const bucketReady = await ensureMaterialsBucketExists();
      if (!bucketReady) {
        debugLog('[MATERIAL_UPDATE] Failed to ensure materials bucket exists');
        throw new Error('Failed to ensure materials bucket exists');
      }
      debugLog('[MATERIAL_UPDATE] Materials bucket is ready');
      
      const updatedMaterial = { ...editingMaterial };
      
      // Process file if a new one was uploaded
      if (editFile) {
        debugLog('[MATERIAL_UPDATE] Processing new file for update');
        if (editingMaterial.type === 'image' && editFile.type.startsWith('image/')) {
          // Convert image to base64
          debugLog('[MATERIAL_UPDATE] Converting image file to base64');
          const base64Data = await convertFileToBase64(editFile);
          updatedMaterial.fileUrl = base64Data;
          debugLog('[MATERIAL_UPDATE] Image file converted to base64 successfully');
        } else {
          // For non-image files, upload to Supabase Storage
          debugLog('[MATERIAL_UPDATE] Preparing to upload non-image file to Supabase Storage:', {
            fileName: editFile.name,
            fileType: editFile.type,
            fileSize: editFile.size
          });
          
          try {
            // Use the uploadFileToStorage function from supabase.ts
            debugLog('[MATERIAL_UPDATE] Calling uploadFileToStorage function');
            const publicUrl = await uploadFileToStorage(editFile, 'materials');
            updatedMaterial.fileUrl = publicUrl;
            debugLog('[MATERIAL_UPDATE] File successfully uploaded to Supabase Storage:', publicUrl);
            
            // Verify the file exists in storage
            try {
              debugLog('[MATERIAL_UPDATE] Verifying file exists in materials bucket');
              const { data: fileList, error: listError } = await supabase.storage
                .from('materials')
                .list();
              
              if (listError) {
                debugLog('[MATERIAL_UPDATE] Error listing files in materials bucket:', listError);
              } else {
                debugLog('[MATERIAL_UPDATE] Files in materials bucket:', fileList);
                
                // Check if our file is in the list
                const fileExists = fileList.some(f => publicUrl.includes(f.name));
                debugLog('[MATERIAL_UPDATE] File exists in bucket:', fileExists);
                
                if (!fileExists) {
                  debugLog('[MATERIAL_UPDATE] File not found in bucket after upload. URL may be incorrect or file not uploaded properly.');
                }
              }
            } catch (verifyError: unknown) {
              debugLog('[MATERIAL_UPDATE] Error verifying file in storage:', verifyError);
            }
          } catch (storageError: unknown) {
            debugLog('[MATERIAL_UPDATE] Supabase Storage upload failed:', storageError);
            throw new Error(`Failed to upload to Supabase Storage: ${(storageError as Error).message || 'Unknown error'}`);
          }
        }
        
        updatedMaterial.fileSize = formatFileSize(editFile.size);
      } else {
        debugLog('[MATERIAL_UPDATE] No new file uploaded, keeping existing file');
      }
      
      // Process content file if a new one was uploaded
      if (editContentFile) {
        try {
          debugLog('[MATERIAL_UPDATE] Preparing to upload new content file to Supabase Storage:', {
            fileName: editContentFile.name,
            fileType: editContentFile.type,
            fileSize: editContentFile.size
          });
          
          // Use the uploadFileToStorage function from supabase.ts
          const contentPublicUrl = await uploadFileToStorage(editContentFile, 'materials');
          updatedMaterial.contentUrl = contentPublicUrl;
          debugLog('[MATERIAL_UPDATE] Content file successfully uploaded to Supabase Storage:', contentPublicUrl);
        } catch (contentUploadErr: unknown) {
          debugLog('[MATERIAL_UPDATE] Error uploading content file:', contentUploadErr);
          alert(`Failed to upload content file: ${(contentUploadErr as Error).message || 'Unknown error'}`);
          // Continue with the process, just use the existing URL
        }
      }
      
      // Process thumbnail file if a new one was uploaded
      if (editThumbnailFile) {
        try {
          debugLog('[MATERIAL_UPDATE] Preparing to upload new thumbnail file to Supabase Storage:', {
            fileName: editThumbnailFile.name,
            fileType: editThumbnailFile.type,
            fileSize: editThumbnailFile.size
          });
          
          // For thumbnails, prefer the 'covers' bucket as it's meant for images
          const thumbnailPublicUrl = await uploadFileToStorage(editThumbnailFile, 'covers');
          updatedMaterial.thumbnailUrl = thumbnailPublicUrl;
          debugLog('[MATERIAL_UPDATE] Thumbnail file successfully uploaded to Supabase Storage:', thumbnailPublicUrl);
        } catch (thumbnailUploadErr: unknown) {
          debugLog('[MATERIAL_UPDATE] Error uploading thumbnail file:', thumbnailUploadErr);
          alert(`Failed to upload thumbnail file: ${(thumbnailUploadErr as Error).message || 'Unknown error'}`);
          // Continue with the process, just use the existing URL
        }
      }
      
      // Update in database
      debugLog('[MATERIAL_UPDATE] Updating material in database', {
        materialId: updatedMaterial.id,
        title: updatedMaterial.title,
        type: updatedMaterial.type,
        fileUrl: updatedMaterial.fileUrl,
        fileSize: updatedMaterial.fileSize,
        contentUrl: updatedMaterial.contentUrl,
        thumbnailUrl: updatedMaterial.thumbnailUrl
      });
      
      const { error } = await supabase
        .from('materials')
        .update({
          title: updatedMaterial.title,
          description: updatedMaterial.description,
          type: updatedMaterial.type,
          fileurl: updatedMaterial.fileUrl,
          filesize: updatedMaterial.fileSize,
          contenturl: updatedMaterial.contentUrl || '',
          thumbnailurl: updatedMaterial.thumbnailUrl || ''
        })
        .eq('id', updatedMaterial.id);
      
      if (error) {
        debugLog('[MATERIAL_UPDATE] Database update error:', error);
        throw error;
      }
      
      debugLog('[MATERIAL_UPDATE] Material updated in database successfully');
      
      // Update in UI
      setMaterials(materials.map(m => 
        m.id === updatedMaterial.id ? updatedMaterial : m
      ));
      debugLog('[MATERIAL_UPDATE] UI updated with updated material');
      
      // Close modal and reset state
      setEditModalOpen(false);
      setEditingMaterial(null);
      setEditFile(null);
      setEditContentFile(null);
      setEditThumbnailFile(null);
      debugLog('[MATERIAL_UPDATE] Material update process completed successfully');
    } catch (err: unknown) {
      debugLog('[MATERIAL_UPDATE] Error updating material:', err);
      alert('Failed to update material: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDownloadMaterial = (material: Material) => {
    // For base64 images
    if (material.type === 'image' && material.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = material.fileUrl;
      link.download = `${material.title}.${material.fileUrl.split(';')[0].split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // For reference paths
    // In a real app, this would trigger a download from your storage
    alert(`In a production environment, this would download: ${material.fileUrl}`);
    
    // Open in a new tab for demo purposes
    window.open(material.fileUrl, '_blank');
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500" size={20} />;
      case 'audio':
        return <Music className="text-purple-500" size={20} />;
      case 'video':
        return <Video className="text-blue-500" size={20} />;
      case 'image':
        return <Image className="text-green-500" size={20} />;
      default:
        return <FileIcon className="text-gray-500" size={20} />;
    }
  };
  
  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Test function to check Supabase storage
  const testSupabaseStorage = async () => {
    debugLog('TESTING: Starting Supabase storage test');
    setTestResult('Testing...');
    
    try {
      // 1. Check if materials bucket exists
      debugLog('TESTING: Checking if materials bucket exists');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        debugLog('TESTING: Error listing buckets:', bucketsError);
        setTestResult(`Error listing buckets: ${bucketsError.message}`);
        return;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'materials');
      debugLog('TESTING: Materials bucket exists:', bucketExists);
      
      if (!bucketExists) {
        debugLog('TESTING: Materials bucket does not exist, attempting to create it');
        const { error: createError } = await supabase.storage.createBucket('materials', {
          public: true
        });
        
        if (createError) {
          debugLog('TESTING: Error creating materials bucket:', createError);
          setTestResult(`Error creating materials bucket: ${createError.message}`);
          return;
        }
        
        debugLog('TESTING: Materials bucket created successfully');
      }
      
      // 2. List files in the materials bucket
      debugLog('TESTING: Listing files in materials bucket');
      const { data: files, error: filesError } = await supabase.storage
        .from('materials')
        .list();
      
      if (filesError) {
        debugLog('TESTING: Error listing files in materials bucket:', filesError);
        setTestResult(`Error listing files: ${filesError.message}`);
        return;
      }
      
      debugLog('TESTING: Files in materials bucket:', files);
      
      // 3. Test uploading a small test file
      debugLog('TESTING: Creating a test file for upload');
      const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test_file.txt', { type: 'text/plain' });
      
      debugLog('TESTING: Uploading test file to materials bucket');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(`test_${Date.now()}.txt`, testFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'text/plain'
        });
      
      if (uploadError) {
        debugLog('TESTING: Error uploading test file:', uploadError);
        setTestResult(`Error uploading test file: ${uploadError.message}`);
        return;
      }
      
      debugLog('TESTING: Test file uploaded successfully:', uploadData);
      
      // 4. Get public URL for the test file
      const { data: urlData } = supabase.storage
        .from('materials')
        .getPublicUrl(uploadData.path);
      
      debugLog('TESTING: Generated public URL for test file:', urlData.publicUrl);
      
      // 5. List files again to verify the test file is there
      const { data: updatedFiles, error: updatedFilesError } = await supabase.storage
        .from('materials')
        .list();
      
      if (updatedFilesError) {
        debugLog('TESTING: Error listing updated files:', updatedFilesError);
      } else {
        debugLog('TESTING: Updated files in materials bucket:', updatedFiles);
      }
      
      setTestResult(`Test completed successfully. Files in bucket: ${updatedFiles ? updatedFiles.length : 'unknown'}`);
    } catch (error: unknown) {
      debugLog('TESTING: Unexpected error during test:', error);
      setTestResult(`Unexpected error: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">Educational Materials</h1>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Upload New Material
        </button>
        <button
          onClick={testSupabaseStorage}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          Test Supabase Storage
        </button>
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          Toggle Debug Panel
        </button>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search materials by title or book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error loading materials</h3>
            <p>{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading materials...</p>
        </div>
      ) : (
        /* Materials Table */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getTypeIcon(material.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-800">{material.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{material.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-primary-700">{material.bookTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        material.type === 'pdf' ? 'bg-red-100 text-red-800' :
                        material.type === 'audio' ? 'bg-purple-100 text-purple-800' :
                        material.type === 'video' ? 'bg-blue-100 text-blue-800' :
                        material.type === 'image' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {material.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.fileSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleDownloadMaterial(material)}
                          className="text-gray-500 hover:text-primary-600"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleEditMaterial(material)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredMaterials.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No materials found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 font-display text-primary-800">Upload New Material</h2>
            
            {uploadError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4 text-sm">
                <p className="font-bold">Storage Warning</p>
                <p>{uploadError}</p>
                <p className="mt-1">Material will be saved with file reference only.</p>
              </div>
            )}
            
            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Book <span className="text-red-500">*</span>
                </label>
                <select 
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a book</option>
                  {allBooks.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  placeholder="Enter material title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                  placeholder="Enter a brief description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newMaterial.type}
                  onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="pdf">PDF Document</option>
                  <option value="audio">Audio File</option>
                  <option value="video">Video File</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewMaterial({...newMaterial, file: e.target.files[0]});
                            }
                          }}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {newMaterial.file ? newMaterial.file.name : 'PDF, MP3, MP4, PNG, JPG up to 10MB'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Note: Image files will be stored directly in database. Other files will use a reference path.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={newMaterial.contentUrl}
                    onChange={(e) => setNewMaterial({...newMaterial, contentUrl: e.target.value})}
                    placeholder="Enter content URL or upload a file"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="relative">
                    <input
                      id="content-file-upload" 
                      name="content-file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewMaterial({...newMaterial, contentFile: e.target.files[0]});
                        }
                      }}
                    />
                    <label 
                      htmlFor="content-file-upload" 
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload
                    </label>
                  </div>
                </div>
                {newMaterial.contentFile && (
                  <p className="mt-1 text-sm text-gray-500">Selected file: {newMaterial.contentFile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={newMaterial.thumbnailUrl}
                    onChange={(e) => setNewMaterial({...newMaterial, thumbnailUrl: e.target.value})}
                    placeholder="Enter thumbnail URL or upload a file"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="relative">
                    <input
                      id="thumbnail-file-upload" 
                      name="thumbnail-file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewMaterial({...newMaterial, thumbnailFile: e.target.files[0]});
                        }
                      }}
                    />
                    <label 
                      htmlFor="thumbnail-file-upload" 
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload
                    </label>
                  </div>
                </div>
                {newMaterial.thumbnailFile && (
                  <p className="mt-1 text-sm text-gray-500">Selected file: {newMaterial.thumbnailFile.name}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center ${
                    isUploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Material'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {editModalOpen && editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 font-display text-primary-800">Edit Material</h2>
            
            <form onSubmit={handleUpdateMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={editingMaterial.title}
                  onChange={(e) => setEditingMaterial({...editingMaterial, title: e.target.value})}
                  placeholder="Enter material title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={editingMaterial.description}
                  onChange={(e) => setEditingMaterial({...editingMaterial, description: e.target.value})}
                  placeholder="Enter a brief description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={editingMaterial.type}
                  onChange={(e) => setEditingMaterial({...editingMaterial, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="pdf">PDF Document</option>
                  <option value="audio">Audio File</option>
                  <option value="video">Video File</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current File
                </label>
                {editingMaterial.type === 'image' && editingMaterial.fileUrl.startsWith('data:image') ? (
                  <div className="mt-1 p-2 border border-gray-200 rounded-lg">
                    <img 
                      src={editingMaterial.fileUrl} 
                      alt={editingMaterial.title}
                      className="max-h-32 max-w-full object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mt-1 p-2 border border-gray-200 rounded-lg">
                    {getTypeIcon(editingMaterial.type)}
                    <span className="text-sm text-gray-600">{editingMaterial.fileUrl.split('/').pop()}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Size: {editingMaterial.fileSize}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace File (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="edit-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a new file</span>
                        <input
                          id="edit-file-upload" 
                          name="edit-file-upload" 
                          type="file" 
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setEditFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {editFile ? editFile.name : 'Leave empty to keep current file'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={editingMaterial.contentUrl}
                    onChange={(e) => setEditingMaterial({...editingMaterial, contentUrl: e.target.value})}
                    placeholder="Enter content URL or upload a file"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="relative">
                    <input
                      id="edit-content-file-upload" 
                      name="edit-content-file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditContentFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label 
                      htmlFor="edit-content-file-upload" 
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload
                    </label>
                  </div>
                </div>
                {editContentFile && (
                  <p className="mt-1 text-sm text-gray-500">Selected file: {editContentFile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={editingMaterial.thumbnailUrl}
                    onChange={(e) => setEditingMaterial({...editingMaterial, thumbnailUrl: e.target.value})}
                    placeholder="Enter thumbnail URL or upload a file"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="relative">
                    <input
                      id="edit-thumbnail-file-upload" 
                      name="edit-thumbnail-file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditThumbnailFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label 
                      htmlFor="edit-thumbnail-file-upload" 
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload
                    </label>
                  </div>
                </div>
                {editThumbnailFile && (
                  <p className="mt-1 text-sm text-gray-500">Selected file: {editThumbnailFile.name}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingMaterial(null);
                    setEditFile(null);
                    setEditContentFile(null);
                    setEditThumbnailFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center ${
                    isUploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Material'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {testResult && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Test Result:</h2>
          <p className="text-sm">{testResult}</p>
        </div>
      )}
      
      {showDebugPanel && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Debug Logs:</h2>
          <div className="overflow-y-auto max-h-96">
            {debugLogs.map((log, index) => (
              <p key={index} className="text-sm">{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterialsPage;