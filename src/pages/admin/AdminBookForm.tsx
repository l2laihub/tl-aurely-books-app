import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Upload, Trash, Loader, AlertCircle, Image as ImageIcon, FileText, Music, Video, File as FileIcon } from 'lucide-react';
import { getBookById, createBook, updateBook, convertFileToBase64, formatFileSize } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';

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
    genres: [''] // Initialize with one empty genre
  });
  
  const [materials, setMaterials] = useState<{
    id?: string;
    book_id?: string;
    title: string;
    description: string;
    type: string;
    fileUrl: string;
    fileSize: string;
    file?: File;
    fileData?: string; // Base64 data for image types
  }[]>([]);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
        genres: book.genre.length > 0 ? book.genre : ['']
      });
      
      setMaterials(book.downloadMaterials || []);

      // Set cover image preview from existing base64 data or URL
      if (book.coverImage) {
        setCoverImagePreview(book.coverImage);
      }
    } catch (err: any) {
      console.error('Error loading book:', err);
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
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
      
      // Convert the file to base64
      convertFileToBase64(file)
        .then(base64String => {
          setFormState({ ...formState, coverImage: base64String });
        })
        .catch(err => {
          console.error('Error converting cover image to base64:', err);
          setError('Failed to process cover image. Please try a different file.');
        });
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
      
      // Filter out empty genres
      const filteredGenres = formState.genres.filter(genre => genre.trim() !== '');
      
      // Process all material files
      const processedMaterials = await Promise.all(
        materials.map(async (material) => {
          // If there's no file to process, return the material as is
          if (!material.file) {
            return material;
          }
          
          try {
            // Handle different file types
            if (material.type === 'image' && material.file.type.startsWith('image/')) {
              // Convert image files to base64
              const base64Data = await convertFileToBase64(material.file);
              return {
                ...material,
                fileUrl: base64Data,
                file: undefined // Clear the file after processing
              };
            } else {
              // For non-image files, generate a unique file name with timestamp
              const fileName = `${Date.now()}-${material.file.name}`;
              return {
                ...material,
                fileUrl: `/downloads/${fileName}`,
                fileSize: formatFileSize(material.file.size),
                file: undefined // Clear the file after processing
              };
            }
          } catch (err) {
            console.error(`Error processing material file:`, err);
            // Return the material without changes if processing fails
            return material;
          }
        })
      );
      
      // Remove any file objects as they're not needed for the database
      const cleanedMaterials = processedMaterials.map(({ file, ...rest }) => rest);
      
      if (isEditMode && id) {
        // Update existing book
        await updateBook(id, {
          ...formState,
          genres: filteredGenres
        }, cleanedMaterials);
      } else {
        // Create new book
        await createBook({
          ...formState,
          genres: filteredGenres
        }, cleanedMaterials);
      }
      
      // Navigate back to the books list
      navigate('/admin/books');
    } catch (err: any) {
      console.error('Error saving book:', err);
      setError(err.message || 'Failed to save book. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddMaterial = () => {
    setMaterials([
      ...materials,
      {
        title: '',
        description: '',
        type: 'pdf',
        fileUrl: '',
        fileSize: '0 KB'
      }
    ]);
  };
  
  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };
  
  const handleMaterialChange = (index: number, field: string, value: string | File) => {
    const updatedMaterials = [...materials];
    
    if (field === 'file' && value instanceof globalThis.File) {
      const material = updatedMaterials[index];
      
      // Update fileSize
      const fileSize = formatFileSize(value.size);
      
      // Store the file object for later processing on form submission
      updatedMaterials[index] = { 
        ...material,
        file: value,
        fileSize: fileSize
      };
      
      // Generate a preview URL for the UI
      if (material.type === 'image' && value.type.startsWith('image/')) {
        // For images, create a temporary object URL for preview
        updatedMaterials[index].fileUrl = URL.createObjectURL(value);
        
        // Also try to convert to base64 in the background for immediate preview
        convertFileToBase64(value)
          .then(base64String => {
            const materialsCopy = [...materials];
            materialsCopy[index] = {
              ...materialsCopy[index],
              fileUrl: base64String,
              fileData: base64String
            };
            setMaterials(materialsCopy);
          })
          .catch(err => {
            console.error('Error converting to base64:', err);
          });
      } else {
        // For non-image files, just store the file name as reference
        updatedMaterials[index].fileUrl = `/downloads/${value.name}`;
      }
    } else {
      // For non-file fields, just update the value
      updatedMaterials[index] = { 
        ...updatedMaterials[index], 
        [field]: value 
      };
    }
    
    setMaterials(updatedMaterials);
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
      </div>
      
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
                      {coverImageFile ? `Selected: ${coverImageFile.name}` : 'Select an image file to upload (JPG, PNG, etc.)'}
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