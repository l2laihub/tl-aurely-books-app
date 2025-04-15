import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getKindnessKitById, 
  createKindnessKit, 
  updateKindnessKit, 
  uploadKitHeroImage 
} from '../../services/kindnessKitService';
import { getAllBooks } from '../../services/bookService';
import { Book } from '../../types/Book';
import { ArrowLeft, Upload, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AdminKindnessKitForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [bookId, setBookId] = useState('');
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [mailerliteGroupId, setMailerliteGroupId] = useState('');
  const [active, setActive] = useState(true);
  
  // UI state
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load books
        const booksData = await getAllBooks();
        setBooks(booksData);
        
        // If in edit mode, load kindness kit data
        if (isEditMode && id) {
          const kitData = await getKindnessKitById(id);
          if (kitData) {
            setTitle(kitData.title);
            setHeadline(kitData.headline || '');
            setSubheadline(kitData.subheadline || '');
            setBookId(kitData.book_id);
            setHeroImageUrl(kitData.hero_image_url || '');
            setMailerliteGroupId(kitData.mailerlite_group_id || '');
            setActive(kitData.active);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);
  
  // Handle hero image selection
  const handleHeroImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeroImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title || !bookId) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      let finalHeroImageUrl = heroImageUrl;
      
      // Upload hero image if a new one was selected
      if (heroImage) {
        if (isEditMode && id) {
          finalHeroImageUrl = await uploadKitHeroImage(heroImage, id);
        } else {
          // For new kits, we'll upload the image after creating the kit
          // so we have an ID to use in the storage path
        }
      }
      
      const kitData = {
        title,
        headline,
        subheadline,
        book_id: bookId,
        hero_image_url: finalHeroImageUrl,
        mailerlite_group_id: mailerliteGroupId,
        active
      };
      
      if (isEditMode && id) {
        // Update existing kit
        await updateKindnessKit(id, kitData);
        
        // Update image URL state and clear preview/file state
        setHeroImageUrl(finalHeroImageUrl);
        setHeroImage(null);
        setHeroImagePreview(null);

        setNotification({
          message: 'Kindness kit updated successfully',
          type: 'success'
        });
        
        // Auto-dismiss notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
          navigate('/admin/kindness-kits');
        }, 1500);
      } else {
        // Create new kit
        const newKitId = await createKindnessKit(kitData);
        
        // Upload hero image if one was selected
        if (heroImage) {
          const imageUrl = await uploadKitHeroImage(heroImage, newKitId);
          await updateKindnessKit(newKitId, { hero_image_url: imageUrl });
        }
        
        setNotification({
          message: 'Kindness kit created successfully',
          type: 'success'
        });
        
        // Auto-dismiss notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
          navigate(`/admin/kindness-kits/${newKitId}/files`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving kindness kit:', err);
      setError('Failed to save kindness kit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} className="mr-2" />
          ) : (
            <XCircle size={20} className="mr-2" />
          )}
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/kindness-kits')}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Kindness Kits
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Edit Kindness Kit' : 'Create New Kindness Kit'}
        </h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ripple Kindness Kit"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Start your ripple with a free kindness kit!"
                />
              </div>
              
              <div>
                <label htmlFor="subheadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Subheadline
                </label>
                <input
                  type="text"
                  id="subheadline"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Download the audiobook, coloring pages, and activities..."
                />
              </div>
              
              <div>
                <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
                  Book <span className="text-red-500">*</span>
                </label>
                <select
                  id="book"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="mailerliteGroupId" className="block text-sm font-medium text-gray-700 mb-1">
                  MailerLite Group ID
                </label>
                <input
                  type="text"
                  id="mailerliteGroupId"
                  value={mailerliteGroupId}
                  onChange={(e) => setMailerliteGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="12345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Create a group in MailerLite and paste its ID here to add subscribers to that group.
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Image
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {heroImagePreview || heroImageUrl ? (
                    <div className="mb-4">
                      <img
                        src={heroImagePreview || heroImageUrl}
                        alt="Hero image preview"
                        className="mx-auto h-48 object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <Upload
                      className="mx-auto h-12 w-12 text-gray-400"
                      strokeWidth={1}
                    />
                  )}
                  
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="hero-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="hero-image-upload"
                        name="hero-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleHeroImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/kindness-kits')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Kit' : 'Create Kit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminKindnessKitForm;