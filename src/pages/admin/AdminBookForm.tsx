import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Upload, Trash, Loader, AlertCircle, Image as ImageIcon, FileText, Music, Video, File as FileIcon } from 'lucide-react';
import { getBookById, createBook, updateBook, convertFileToBase64, formatFileSize } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Material {
  id?: string;
  book_id?: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize: string;
  file?: File;
  fileData?: string;
}

const AdminBookForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { isAuthenticated } = useAuth();
  
  const [formState, setFormState] = useState({
    title: '',
    author: '',
    description: '',
    publishDate: '',
    isbn: '',
    pages: 0,
    ageRange: '',
    coverImage: '',
    genres: [''], // Initialize with one empty genre
    amazonLink: '',
    reviewLink: ''
  });
  
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Custom debug logger that shows in UI
  const debugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = data 
      ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`
      : `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    setDebugLogs(prev => [logMessage, ...prev]);
  };
  
  // Test function to verify Supabase storage
  const testSupabaseStorage = async () => {
    debugLog('[TEST] Starting Supabase storage test');
    
    try {
      // 1. List buckets
      debugLog('[TEST] Listing storage buckets');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        debugLog('[TEST] Error listing buckets', bucketsError);
        throw new Error(`Failed to list buckets: ${bucketsError.message}`);
      }
      
      debugLog('[TEST] Buckets retrieved successfully', { 
        count: buckets.length,
        buckets: buckets.map(b => b.name)
      });
      
      // 2. Find a suitable bucket to use
      if (buckets.length === 0) {
        debugLog('[TEST] No buckets available. Cannot proceed with storage test.');
        setError('No storage buckets available. Please contact an administrator.');
        return;
      }
      
      // Use the first available bucket
      const bucketToUse = buckets[0].name;
      debugLog('[TEST] Using bucket for test', { bucket: bucketToUse });
      
      // 4. Create a test file
      debugLog('[TEST] Creating test file');
      const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test-file.txt', { type: 'text/plain' });
      
      // 5. Upload test file
      const filePath = `test/test-${Date.now()}.txt`;
      debugLog('[TEST] Uploading test file', { path: filePath, bucket: bucketToUse });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketToUse)
        .upload(filePath, testFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        debugLog('[TEST] Error uploading test file', uploadError);
        throw new Error(`Failed to upload test file: ${uploadError.message}`);
      }
      
      debugLog('[TEST] Test file uploaded successfully', uploadData);
      
      // 6. Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketToUse)
        .getPublicUrl(filePath);
      
      debugLog('[TEST] Generated public URL', { url: urlData.publicUrl });
      
      // 7. Try to fetch the file to verify it's accessible
      debugLog('[TEST] Verifying file is accessible');
      try {
        const response = await fetch(urlData.publicUrl);
        if (response.ok) {
          debugLog('[TEST] File is accessible', { status: response.status });
        } else {
          debugLog('[TEST] File is not accessible', { status: response.status });
        }
      } catch (fetchError) {
        debugLog('[TEST] Error fetching file', fetchError);
      }
      
      debugLog('[TEST] Supabase storage test completed successfully');
    } catch (err) {
      debugLog('[TEST] Supabase storage test failed', err);
      setError(`Storage test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Load book data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadBookData(id);
    }
  }, [id, isEditMode]);
  
  const loadBookData = async (bookId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      debugLog('[BOOK_FORM] Loading book data', { bookId });
      const book = await getBookById(bookId);
      
      setFormState({
        title: book.title,
        author: book.author,
        description: book.description,
        publishDate: book.publishDate,
        isbn: book.isbn,
        pages: book.pages,
        ageRange: book.ageRange,
        coverImage: book.coverImage,
        genres: book.genre.length > 0 ? book.genre : [''],
        amazonLink: book.amazonLink,
        reviewLink: book.reviewLink
      });
      
      setMaterials(book.downloadMaterials || []);

      // Set cover image preview from existing base64 data or URL
      if (book.coverImage) {
        debugLog('[BOOK_FORM] Setting cover image preview', { 
          imageType: book.coverImage.startsWith('data:image') ? 'base64' : 'url',
          imageLength: book.coverImage.length
        });
        setCoverImagePreview(book.coverImage);
      }
    } catch (err: any) {
      debugLog('[BOOK_FORM] Error loading book', err);
      setError('Failed to load book data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'pages') {
      setFormState({ ...formState, [name]: parseInt(value) || 0 });
    } else {
      setFormState({ ...formState, [name]: value });
    }
  };
  
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      debugLog(`[COVER_IMAGE] Cover image selected`, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        debugLog(`[COVER_IMAGE] Selected file is not an image`, { fileType: file.type });
        setError('Please select an image file for the cover image.');
        return;
      }
      
      try {
        debugLog(`[COVER_IMAGE] Attempting to upload cover image to Supabase storage`);
        
        // Use the covers bucket directly instead of listing buckets
        const bucketToUse = 'covers';
        debugLog(`[COVER_IMAGE] Using bucket for upload`, { bucket: bucketToUse });
        
        // Upload the file to Supabase storage
        const filePath = `${Date.now()}-${file.name}`;
        debugLog(`[COVER_IMAGE] Uploading file to path: ${filePath}`);
        
        const { data, error } = await supabase.storage
          .from(bucketToUse)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          debugLog(`[COVER_IMAGE] Error uploading to Supabase storage`, error);
          throw error;
        }
        
        debugLog(`[COVER_IMAGE] File uploaded successfully`, data);
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketToUse)
          .getPublicUrl(filePath);
        
        debugLog(`[COVER_IMAGE] Generated public URL`, { url: urlData.publicUrl });
        
        // Update the form state with the public URL
        setFormState(prev => ({
          ...prev,
          coverImage: urlData.publicUrl
        }));
        
        // Create a preview for the UI
        const reader = new FileReader();
        reader.onloadend = () => {
          debugLog(`[COVER_IMAGE] Created local preview URL`);
          setCoverImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
      } catch (err) {
        debugLog(`[COVER_IMAGE] Error uploading cover image`, err);
        
        // Fallback to base64 if Supabase upload fails
        debugLog(`[COVER_IMAGE] Falling back to base64 conversion`);
        try {
          const base64Data = await convertFileToBase64(file);
          debugLog(`[COVER_IMAGE] Successfully converted to base64`);
          
          setFormState(prev => ({
            ...prev,
            coverImage: base64Data
          }));
          setCoverImagePreview(base64Data);
        } catch (base64Err) {
          debugLog(`[COVER_IMAGE] Error converting to base64`, base64Err);
          setError('Failed to process the cover image. Please try again.');
        }
      }
    }
  };

  const handleGenreChange = (index: number, value: string) => {
    const updatedGenres = [...formState.genres];
    updatedGenres[index] = value;
    setFormState({ ...formState, genres: updatedGenres });
  };
  
  const addGenre = () => {
    setFormState({ ...formState, genres: [...formState.genres, ''] });
  };
  
  const removeGenre = (index: number) => {
    if (formState.genres.length > 1) {
      const updatedGenres = formState.genres.filter((_, i) => i !== index);
      setFormState({ ...formState, genres: updatedGenres });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsSaving(true);
      debugLog('[BOOK_SUBMIT] Starting book submission process');
      
      // Filter out empty genres
      const filteredGenres = formState.genres.filter(genre => genre.trim() !== '');
      debugLog('[BOOK_SUBMIT] Filtered genres', filteredGenres);
      
      // Process all material files
      debugLog('[BOOK_SUBMIT] Processing materials', { count: materials.length });
      const processedMaterials = await Promise.all(
        materials.map(async (material, index) => {
          // If there's no file to process, return the material as is
          if (!material.file) {
            debugLog(`[BOOK_SUBMIT] Material ${index + 1} has no file to process`);
            return material;
          }
          
          try {
            debugLog(`[BOOK_SUBMIT] Processing material ${index + 1}`, {
              title: material.title,
              type: material.type,
              fileName: material.file.name,
              fileSize: material.file.size
            });
            
            // Handle different file types
            if (material.type === 'image' && material.file.type.startsWith('image/')) {
              // Convert image files to base64
              debugLog(`[BOOK_SUBMIT] Converting image to base64`);
              const base64Data = await convertFileToBase64(material.file);
              debugLog(`[BOOK_SUBMIT] Image converted to base64 successfully`);
              return {
                ...material,
                fileUrl: base64Data,
                file: undefined // Clear the file after processing
              };
            } else {
              debugLog(`[BOOK_SUBMIT] Uploading file to Supabase storage`);
              
              // Use the materials bucket directly instead of listing buckets
              const bucketToUse = 'materials';
              debugLog(`[BOOK_SUBMIT] Using bucket for upload`, { bucket: bucketToUse });
              
              // Upload the file to Supabase storage
              const filePath = `${Date.now()}-${material.file.name}`;
              debugLog(`[BOOK_SUBMIT] Uploading file to path: ${filePath}`);
              
              const { data, error } = await supabase.storage
                .from(bucketToUse)
                .upload(filePath, material.file, {
                  cacheControl: '3600',
                  upsert: true
                });
              
              if (error) {
                debugLog(`[BOOK_SUBMIT] Error uploading file`, error);
                setError(`Failed to upload file: ${error.message}`);
                // Return the original material instead of undefined
                return material;
              }
              
              debugLog(`[BOOK_SUBMIT] File uploaded successfully`, data);
              
              // Get the public URL
              const { data: urlData } = supabase.storage
                .from(bucketToUse)
                .getPublicUrl(filePath);
              
              debugLog(`[BOOK_SUBMIT] Generated public URL`, { url: urlData.publicUrl });
              
              return {
                ...material,
                fileUrl: urlData.publicUrl,
                file: undefined // Clear the file after processing
              };
            }
          } catch (err) {
            debugLog(`[BOOK_SUBMIT] Error processing material ${index + 1}`, err);
            setError(`Error processing material: ${err instanceof Error ? err.message : String(err)}`);
            // Return the original material instead of undefined
            return material;
          }
        })
      );
      
      // Remove any file objects as they're not needed for the database
      const cleanedMaterials = processedMaterials.map(({ file, ...rest }) => rest);
      debugLog('[BOOK_SUBMIT] Processed all materials', { count: cleanedMaterials.length });
      
      if (isEditMode && id) {
        // Update existing book
        debugLog('[BOOK_SUBMIT] Updating existing book', { id });
        await updateBook(id, {
          ...formState,
          genres: filteredGenres
        }, cleanedMaterials);
        debugLog('[BOOK_SUBMIT] Book updated successfully');
      } else {
        // Create new book
        debugLog('[BOOK_SUBMIT] Creating new book');
        await createBook({
          ...formState,
          genres: filteredGenres
        }, cleanedMaterials);
        debugLog('[BOOK_SUBMIT] Book created successfully');
      }
      
      // Navigate back to the books list
      debugLog('[BOOK_SUBMIT] Navigating back to books list');
      navigate('/admin/books');
    } catch (err: any) {
      debugLog('[BOOK_SUBMIT] Error saving book', err);
      setError(err.message || 'Failed to save book. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddMaterial = () => {
    debugLog(`[MATERIAL_ADD] Adding new material`);
    
    // Create a new material with default values
    const newMaterial: Material = {
      title: '',
      description: '',
      type: 'pdf',
      fileUrl: '',
      fileSize: '0 KB'
    };
    
    setMaterials([...materials, newMaterial]);
    debugLog(`[MATERIAL_ADD] New material added successfully`);
  };
  
  const handleRemoveMaterial = (index: number) => {
    const updatedMaterials = [...materials];
    const removedMaterial = updatedMaterials[index];
    
    if (!removedMaterial) {
      debugLog(`[MATERIAL_REMOVE] Error: Material at index ${index} not found`);
      return;
    }
    
    debugLog(`[MATERIAL_REMOVE] Removing material at index ${index}`, {
      title: removedMaterial.title,
      type: removedMaterial.type
    });
    
    // If there's a file URL that's an object URL, revoke it to prevent memory leaks
    if (removedMaterial.fileUrl && removedMaterial.fileUrl.startsWith('blob:')) {
      debugLog(`[MATERIAL_REMOVE] Revoking object URL`);
      URL.revokeObjectURL(removedMaterial.fileUrl);
    }
    
    updatedMaterials.splice(index, 1);
    setMaterials(updatedMaterials);
    debugLog(`[MATERIAL_REMOVE] Material removed successfully`);
  };
  
  const handleMaterialChange = (index: number, field: string, value: string | File) => {
    const updatedMaterials = [...materials];
    const material = updatedMaterials[index];
    
    if (!material) {
      debugLog(`[MATERIAL_CHANGE] Error: Material at index ${index} not found`);
      return;
    }
    
    const updatedMaterial = { ...material };
    
    if (field === 'file' && value instanceof File) {
      debugLog(`[MATERIAL_CHANGE] File selected for material at index ${index}`, {
        fileName: value.name,
        fileSize: value.size,
        fileType: value.type
      });
      
      updatedMaterial.file = value;
      updatedMaterial.fileSize = formatFileSize(value.size);
      
      // For images, create a preview URL
      if (updatedMaterial.type === 'image' && value.type.startsWith('image/')) {
        debugLog(`[MATERIAL_CHANGE] Creating preview URL for image`);
        // Revoke previous URL if it exists and is an object URL
        if (updatedMaterial.fileUrl && updatedMaterial.fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(updatedMaterial.fileUrl);
        }
        updatedMaterial.fileUrl = URL.createObjectURL(value);
      } else {
        // For non-image files, just store the file name as reference
        debugLog(`[MATERIAL_CHANGE] Setting file name reference for non-image file`);
        updatedMaterial.fileUrl = `/downloads/${value.name}`;
      }
    } else if (typeof value === 'string') {
      (updatedMaterial as any)[field] = value;
    }
    
    updatedMaterials[index] = updatedMaterial;
    setMaterials(updatedMaterials);
    debugLog(`[MATERIAL_CHANGE] Material updated successfully`);
  };

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader size={40} className="animate-spin text-primary-600 mb-4" />
        <p className="text-primary-600">Loading book data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link 
          to="/admin/books" 
          className="mr-4 text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-display font-bold text-primary-800">
          {isEditMode ? 'Edit Book' : 'Add New Book'}
        </h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={testSupabaseStorage}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-1 px-3 rounded-lg text-sm transition-colors"
            type="button"
            title="Test Storage"
          >
            Test Storage
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-lg text-sm transition-colors"
            type="button"
            title="Toggle Debug Panel"
          >
            Debug
          </button>
        </div>
      </div>
      
      {showDebugPanel && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-auto max-h-96">
          <h2 className="text-lg font-medium mb-2">Debug Logs:</h2>
          {debugLogs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Try uploading a file.</p>
          ) : (
            <div className="text-xs font-mono whitespace-pre-wrap">
              {debugLogs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-100">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-primary-800 font-display">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="author"
                value={formState.author}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cover image preview */}
                <div className="border border-gray-300 rounded-lg p-2 flex items-center justify-center bg-gray-50">
                  {coverImagePreview ? (
                    <img 
                      src={coverImagePreview} 
                      alt="Cover preview" 
                      className="max-h-48 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 text-gray-400">
                      <ImageIcon size={48} className="mx-auto mb-2" />
                      <p>No image selected</p>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  {/* File upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Cover Image <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required={!coverImagePreview}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Select an image file to upload (JPG, PNG, etc.)
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      For best performance, use images under 1MB in size
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ageRange"
                value={formState.ageRange}
                onChange={handleChange}
                placeholder="e.g., 3-6 years"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="publishDate"
                value={formState.publishDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="isbn"
                value={formState.isbn}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pages <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pages"
                value={formState.pages}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amazon Link
              </label>
              <input
                type="text"
                name="amazonLink"
                value={formState.amazonLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Link
              </label>
              <input
                type="text"
                name="reviewLink"
                value={formState.reviewLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        
        {/* Genres */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary-800 font-display">Genres</h2>
            <button
              type="button"
              onClick={addGenre}
              className="flex items-center text-primary-600 hover:text-primary-800"
            >
              <Plus size={18} className="mr-1" />
              Add Genre
            </button>
          </div>
          
          <div className="space-y-3">
            {formState.genres.map((genre, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => handleGenreChange(index, e.target.value)}
                  placeholder="e.g., Educational, Adventure, Fantasy"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {formState.genres.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGenre(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Educational Materials */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary-800 font-display">Educational Materials</h2>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="flex items-center text-primary-600 hover:text-primary-800"
            >
              <Plus size={18} className="mr-1" />
              Add Material
            </button>
          </div>
          
          {materials.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No materials added yet</p>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="mt-3 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
              >
                Add Your First Material
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {materials.map((material, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <h3 className="font-medium text-primary-800">Material #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={material.title}
                        onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={material.type}
                        onChange={(e) => handleMaterialChange(index, 'type', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="audio">Audio File</option>
                        <option value="video">Video File</option>
                        <option value="image">Image</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={material.description}
                        onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                        required
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File <span className="text-red-500">*</span>
                      </label>
                      
                      {material.type === 'image' && material.fileUrl && material.fileUrl.startsWith('data:image') && (
                        <div className="mb-3 p-2 border border-gray-200 rounded-lg">
                          <img 
                            src={material.fileUrl} 
                            alt={material.title}
                            className="max-h-32 max-w-full object-contain mx-auto"
                          />
                        </div>
                      )}
                      
                      {material.fileUrl && !material.fileUrl.startsWith('data:') && (
                        <div className="mb-3 p-2 border border-gray-200 rounded-lg flex items-center">
                          {material.type === 'pdf' && <FileText className="text-red-500 mr-2" size={20} />}
                          {material.type === 'audio' && <Music className="text-purple-500 mr-2" size={20} />}
                          {material.type === 'video' && <Video className="text-blue-500 mr-2" size={20} />}
                          {(material.type === 'other' || !['pdf', 'audio', 'video', 'image'].includes(material.type)) && 
                            <FileIcon className="text-gray-500 mr-2" size={20} />}
                          <span className="text-sm text-gray-600">{material.fileUrl.split('/').pop()}</span>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleMaterialChange(index, 'file', file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required={!material.fileUrl}
                      />
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {material.type === 'image' ? (
                          <>
                            <span className="text-amber-600 font-medium">Images will be stored as base64 in the database.</span>
                            <br />
                          </>
                        ) : (
                          <>
                            <span className="text-amber-600 font-medium">Non-image files use reference paths only.</span>
                            <br />
                          </>
                        )}
                        {material.file ? `Selected: ${material.file.name} (${material.fileSize})` : 
                         material.fileUrl ? `Current file: ${material.fileSize}` : 
                         'Select a file to upload'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/admin/books"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditMode ? 'Update Book' : 'Create Book'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBookForm;