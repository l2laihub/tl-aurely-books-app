import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Loader, AlertCircle, Calendar, Link as LinkIcon } from 'lucide-react';
import { getUpcomingBookById, createUpcomingBook, updateUpcomingBook } from '../../services/upcomingBookService';
import { convertFileToBase64 } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AdminUpcomingBookForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { isAuthenticated } = useAuth();
  
  const [formState, setFormState] = useState({
    title: '',
    author: '',
    description: '',
    coverImageUrl: '',
    expectedReleaseDate: '',
    preorderUrl: ''
  });
  
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load upcoming book data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadUpcomingBookData(id);
    }
  }, [id, isEditMode]);
  
  const loadUpcomingBookData = async (bookId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const book = await getUpcomingBookById(bookId);
      
      setFormState({
        title: book.title,
        author: book.author,
        description: book.description,
        coverImageUrl: book.coverImageUrl,
        expectedReleaseDate: book.expectedReleaseDate.split('T')[0], // Format date for input
        preorderUrl: book.preorderUrl || ''
      });
      
      // Set cover image preview
      if (book.coverImageUrl) {
        setCoverImagePreview(book.coverImageUrl);
      }
    } catch (err: any) {
      console.error('Error loading upcoming book:', err);
      setError('Failed to load upcoming book data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };
  
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file for the cover image.');
        return;
      }
      
      try {
        // Try to upload to Supabase storage first
        const bucketToUse = 'covers';
        const filePath = `upcoming-${Date.now()}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from(bucketToUse)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          throw error;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketToUse)
          .getPublicUrl(filePath);
        
        // Update the form state with the public URL
        setFormState(prev => ({
          ...prev,
          coverImageUrl: urlData.publicUrl
        }));
        
        // Create a preview for the UI
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
      } catch (err) {
        console.error('Error uploading cover image:', err);
        
        // Fallback to base64 if Supabase upload fails
        try {
          const base64Data = await convertFileToBase64(file);
          
          setFormState(prev => ({
            ...prev,
            coverImageUrl: base64Data
          }));
          setCoverImagePreview(base64Data);
        } catch (base64Err) {
          console.error('Error converting to base64:', base64Err);
          setError('Failed to process the cover image. Please try again.');
        }
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formState.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formState.author.trim()) {
      setError('Author is required');
      return;
    }
    
    if (!formState.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formState.coverImageUrl) {
      setError('Cover image is required');
      return;
    }
    
    if (!formState.expectedReleaseDate) {
      setError('Expected release date is required');
      return;
    }
    
    try {
      setIsSaving(true);
      
      if (isEditMode && id) {
        // Update existing upcoming book
        await updateUpcomingBook(id, formState);
      } else {
        // Create new upcoming book
        await createUpcomingBook(formState);
      }
      
      // Navigate back to the upcoming books list
      navigate('/admin/upcoming-books');
    } catch (err: any) {
      console.error('Error saving upcoming book:', err);
      setError(err.message || 'Failed to save upcoming book. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={40} className="animate-spin text-primary-600 mr-3" />
        <p className="text-primary-600 text-lg">Loading upcoming book data...</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link 
          to="/admin/upcoming-books" 
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-primary-600" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-primary-800">
          {isEditMode ? 'Edit Upcoming Book' : 'Add New Upcoming Book'}
        </h1>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Image */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="mb-4">
              {coverImagePreview ? (
                <div className="relative">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover Preview" 
                    className="w-full h-auto rounded-lg border border-gray-300 object-cover"
                    style={{ maxHeight: '300px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImagePreview(null);
                      setFormState(prev => ({ ...prev, coverImageUrl: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <AlertCircle size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a cover image
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          
          {/* Book Details */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter book title"
                  required
                />
              </div>
              
              {/* Author */}
              <div className="md:col-span-2">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formState.author}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter author name"
                  required
                />
              </div>
              
              {/* Expected Release Date */}
              <div>
                <label htmlFor="expectedReleaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Expected Release Date
                  </div>
                </label>
                <input
                  type="date"
                  id="expectedReleaseDate"
                  name="expectedReleaseDate"
                  value={formState.expectedReleaseDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Preorder URL */}
              <div>
                <label htmlFor="preorderUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <LinkIcon size={16} className="mr-1" />
                    Pre-order URL (optional)
                  </div>
                </label>
                <input
                  type="url"
                  id="preorderUrl"
                  name="preorderUrl"
                  value={formState.preorderUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="https://example.com/book-preorder"
                />
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter book description"
                  required
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Link
            to="/admin/upcoming-books"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isEditMode ? 'Update Book' : 'Save Book'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpcomingBookForm;