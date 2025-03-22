import React, { useState, useEffect } from 'react';
import { books } from '../../data/books';
import { FileText, Music, Video, Image, File as FileIcon, Trash, Edit, Download, Plus, Search, Upload, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { convertFileToBase64, formatFileSize } from '../../services/bookService';

interface Material {
  id: string;
  book_id: string;
  bookTitle?: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize: string;
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
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Edit material state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
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
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
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
    } catch (err: any) {
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
      
      let fileUrl = '';
      let fileSize = '';
      
      // Handle file upload based on type
      if (newMaterial.file) {
        try {
          // Convert image files to base64, store others as references
          if (newMaterial.type === 'image' && newMaterial.file.type.startsWith('image/')) {
            const base64Data = await convertFileToBase64(newMaterial.file);
            fileUrl = base64Data;
          } else {
            // For other file types, save to public/downloads and use reference path
            // In a real app, you'd upload to cloud storage instead
            const fileName = `${Date.now()}-${newMaterial.file.name}`;
            fileUrl = `/downloads/${fileName}`;
            
            // Here we would normally upload to cloud storage
            // Since we can't directly write to disk in this environment,
            // we'll just use the reference path and handle later
            console.log(`Saving file reference: ${fileUrl}`);
          }
          
          fileSize = formatFileSize(newMaterial.file.size);
        } catch (uploadErr: any) {
          console.error('Error processing file:', uploadErr);
          setUploadError(uploadErr.message || 'Error processing file. Using file name as reference.');
          
          // Fallback to using the file name as a reference
          fileUrl = `/downloads/${newMaterial.file.name}`;
          fileSize = formatFileSize(newMaterial.file.size);
        }
      }
      
      // Save the material to the database
      const { data, error } = await supabase
        .from('materials')
        .insert({
          book_id: selectedBook,
          title: newMaterial.title,
          description: newMaterial.description,
          type: newMaterial.type,
          fileurl: fileUrl, // Using snake_case for the database field
          filesize: fileSize // Using snake_case for the database field
        })
        .select();
      
      if (error) throw error;
      
      // Update UI
      const bookTitle = allBooks.find(book => book.id === selectedBook)?.title || 'Unknown Book';
      if (data && data[0]) {
        setMaterials([
          ...materials,
          {
            ...data[0],
            bookTitle,
            fileUrl: data[0].fileurl,
            fileSize: data[0].filesize
          }
        ]);
      }
      
      // Reset form and close modal
      setNewMaterial({
        title: '',
        description: '',
        type: 'pdf',
        file: null
      });
      setSelectedBook('');
      setUploadModalOpen(false);
    } catch (err: any) {
      console.error('Error uploading material:', err);
      alert('Failed to upload material: ' + err.message);
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
      
      let updatedMaterial = { ...editingMaterial };
      
      // Process file if a new one was uploaded
      if (editFile) {
        if (editingMaterial.type === 'image' && editFile.type.startsWith('image/')) {
          // Convert image to base64
          const base64Data = await convertFileToBase64(editFile);
          updatedMaterial.fileUrl = base64Data;
        } else {
          // For other file types, generate file path
          const fileName = `${Date.now()}-${editFile.name}`;
          updatedMaterial.fileUrl = `/downloads/${fileName}`;
        }
        
        updatedMaterial.fileSize = formatFileSize(editFile.size);
      }
      
      // Update in database
      const { error } = await supabase
        .from('materials')
        .update({
          title: updatedMaterial.title,
          description: updatedMaterial.description,
          type: updatedMaterial.type,
          fileurl: updatedMaterial.fileUrl,
          filesize: updatedMaterial.fileSize
        })
        .eq('id', updatedMaterial.id);
      
      if (error) throw error;
      
      // Update in UI
      setMaterials(materials.map(m => 
        m.id === updatedMaterial.id ? updatedMaterial : m
      ));
      
      // Close modal and reset state
      setEditModalOpen(false);
      setEditingMaterial(null);
      setEditFile(null);
    } catch (err: any) {
      console.error('Error updating material:', err);
      alert('Failed to update material: ' + err.message);
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
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingMaterial(null);
                    setEditFile(null);
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
    </div>
  );
};

export default AdminMaterialsPage;