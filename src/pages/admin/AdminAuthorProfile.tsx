import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image, AlertCircle, Loader, Plus, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuthorProfile, saveAuthorProfile, uploadAuthorPhoto } from '../../services/authorService';
import type { AuthorProfileData } from '../../services/authorService';

const AdminAuthorProfile: React.FC = () => {
  const [profile, setProfile] = useState<AuthorProfileData>({
    name: '',
    title: '',
    photo_url: '',
    bio: [''],
    quote: '',
    creative_process: [''],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadAuthorProfile();
  }, []);

  const loadAuthorProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await getAuthorProfile();
      
      if (profileData) {
        setProfile(profileData);
        setPhotoPreview(profileData.photo_url);
      }
    } catch (err: Error | unknown) {
      console.error('Error loading author profile:', err);
      setError('Failed to load author profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index: number, field: 'bio' | 'creative_process', value: string) => {
    setProfile(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddArrayItem = (field: 'bio' | 'creative_process') => {
    setProfile(prev => {
      const newArray = [...prev[field], ''];
      return { ...prev, [field]: newArray };
    });
  };

  const handleRemoveArrayItem = (index: number, field: 'bio' | 'creative_process') => {
    if (profile[field].length <= 1) return; // Keep at least one paragraph
    
    setProfile(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload the file
      const photoUrl = await uploadAuthorPhoto(file);
      setProfile(prev => ({ ...prev, photo_url: photoUrl }));
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: Error | unknown) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!profile.name.trim()) {
      setError('Author name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      await saveAuthorProfile(profile);
      setSuccessMessage('Author profile saved successfully!');
      
      // Hide the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: Error | unknown) {
      console.error('Error saving author profile:', err);
      setError('Failed to save author profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/authors')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Back to authors list"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-display font-bold text-primary-800">
            {profile.id ? 'Edit Author Profile' : 'Create Author Profile'}
          </h1>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading author profile...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
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

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-primary-800">Basic Information</h2>
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name
                  </label>
                  <input 
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Title
                  </label>
                  <input 
                    type="text"
                    id="title"
                    name="title"
                    value={profile.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g. Award-winning children's book author & educator"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Quote
                  </label>
                  <textarea 
                    id="quote"
                    name="quote"
                    value={profile.quote}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="A memorable quote from the author"
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-4 text-primary-800 self-start">Author Photo</h2>
                
                <div className="relative mb-4">
                  <div className="w-64 h-64 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-4 border-primary-200">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Author preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image size={64} className="text-gray-400" />
                    )}
                  </div>
                  
                  <input 
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                    aria-label="Upload author photo"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-full shadow-md"
                    aria-label="Upload photo"
                  >
                    <Image size={24} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 text-center">
                  Click the button to upload a new photo. <br />
                  Recommended: Square image, at least 500x500 pixels.
                </p>
              </div>
            </div>
            
            {/* Author Bio */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-primary-800">Author Biography</h2>
                <button 
                  type="button" 
                  onClick={() => handleAddArrayItem('bio')}
                  className="text-primary-600 hover:text-primary-500 flex items-center"
                  aria-label="Add biography paragraph"
                >
                  <Plus size={18} className="mr-1" />
                  Add Paragraph
                </button>
              </div>
              
              <div className="space-y-4">
                {profile.bio.map((paragraph, index) => (
                  <div key={`bio-${index}`} className="flex items-start space-x-2">
                    <textarea 
                      value={paragraph}
                      onChange={(e) => handleArrayChange(index, 'bio', e.target.value)}
                      rows={3}
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Biography paragraph ${index + 1}`}
                    />
                    
                    <button 
                      type="button" 
                      onClick={() => handleRemoveArrayItem(index, 'bio')}
                      className={`text-red-500 hover:text-red-700 p-2 ${profile.bio.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={profile.bio.length <= 1}
                      aria-label="Remove paragraph"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Creative Process */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-primary-800">Creative Process</h2>
                <button 
                  type="button" 
                  onClick={() => handleAddArrayItem('creative_process')}
                  className="text-primary-600 hover:text-primary-500 flex items-center"
                  aria-label="Add creative process paragraph"
                >
                  <Plus size={18} className="mr-1" />
                  Add Paragraph
                </button>
              </div>
              
              <div className="space-y-4">
                {profile.creative_process.map((paragraph, index) => (
                  <div key={`creative-${index}`} className="flex items-start space-x-2">
                    <textarea 
                      value={paragraph}
                      onChange={(e) => handleArrayChange(index, 'creative_process', e.target.value)}
                      rows={3}
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Creative process paragraph ${index + 1}`}
                    />
                    
                    <button 
                      type="button" 
                      onClick={() => handleRemoveArrayItem(index, 'creative_process')}
                      className={`text-red-500 hover:text-red-700 p-2 ${profile.creative_process.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={profile.creative_process.length <= 1}
                      aria-label="Remove paragraph"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAuthorProfile;
