import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Music, Video, Image, File as FileIcon, Trash, Edit, Play, Plus, Search, Upload, Loader, AlertCircle, Youtube, Headphones, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getMultimediaByBookId, createMultimedia, updateMultimedia, deleteMultimedia } from '../../services/multimediaService';
import { getAllBooks } from '../../services/bookService';

interface MultimediaContent {
  id: string;
  book_id: string;
  bookTitle?: string;
  title: string;
  description: string;
  type: 'video' | 'audio';
  url: string;
  thumbnail: string;
}

const AdminMultimedia: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multimedia, setMultimedia] = useState<MultimediaContent[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form state for new multimedia upload
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'audio',
    url: '',
    thumbnail: ''
  });
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<MultimediaContent | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  
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
      const booksData = await getAllBooks();
      setAllBooks(booksData || []);
      
      // Load all multimedia with book data
      let allMultimedia: MultimediaContent[] = [];
      
      for (const book of booksData) {
        const bookMultimedia = await getMultimediaByBookId(book.id);
        
        // Add book title to each item
        const enhancedMultimedia = bookMultimedia.map(item => ({
          ...item,
          bookTitle: book.title
        }));
        
        allMultimedia = [...allMultimedia, ...enhancedMultimedia];
      }
      
      setMultimedia(allMultimedia);
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMultimedia = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this multimedia item?')) {
      return;
    }
    
    try {
      await deleteMultimedia(id);
      
      // Remove from UI
      setMultimedia(multimedia.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Error deleting multimedia:', err);
      alert('Failed to delete multimedia item');
    }
  };
  
  const handleUploadMultimedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook) {
      alert('Please select a book');
      return;
    }
    
    if (!newContent.title || !newContent.description || !newContent.url || !newContent.thumbnail) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Save the multimedia to the database
      await createMultimedia({
        book_id: selectedBook,
        title: newContent.title,
        description: newContent.description,
        type: newContent.type,
        url: newContent.url,
        thumbnail: newContent.thumbnail
      });
      
      // Update UI
      const bookTitle = allBooks.find(book => book.id === selectedBook)?.title || 'Unknown Book';
      const newItem: MultimediaContent = {
        id: 'temp-id', // Will be replaced on reload
        book_id: selectedBook,
        bookTitle: bookTitle,
        title: newContent.title,
        description: newContent.description,
        type: newContent.type,
        url: newContent.url,
        thumbnail: newContent.thumbnail
      };
      
      setMultimedia([newItem, ...multimedia]);
      
      // Reset form and close modal
      setNewContent({
        title: '',
        description: '',
        type: 'video',
        url: '',
        thumbnail: ''
      });
      setSelectedBook('');
      setUploadModalOpen(false);
      
      // Reload data to get proper IDs
      loadData();
      
    } catch (err: any) {
      console.error('Error uploading multimedia:', err);
      alert('Failed to upload multimedia: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleEditMultimedia = (item: MultimediaContent) => {
    setEditingContent(item);
    setEditModalOpen(true);
  };
  
  const handleUpdateMultimedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingContent) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Update the multimedia in the database
      await updateMultimedia(editingContent.id, {
        title: editingContent.title,
        description: editingContent.description,
        type: editingContent.type,
        url: editingContent.url,
        thumbnail: editingContent.thumbnail
      });
      
      // Update UI
      setMultimedia(multimedia.map(item => 
        item.id === editingContent.id ? editingContent : item
      ));
      
      // Close modal
      setEditModalOpen(false);
      setEditingContent(null);
      
    } catch (err: any) {
      console.error('Error updating multimedia:', err);
      alert('Failed to update multimedia: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="text-blue-500" size={20} />;
      case 'audio':
        return <Music className="text-purple-500" size={20} />;
      default:
        return <FileIcon className="text-gray-500" size={20} />;
    }
  };
  
  // Detect if URL is from a known platform
  const getUrlPlatformIcon = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <Youtube className="text-red-500 ml-2" size={16} />;
    } else if (url.includes('vimeo.com')) {
      return <Video className="text-blue-400 ml-2" size={16} />;
    } else if (url.includes('spotify.com')) {
      return <Headphones className="text-green-500 ml-2" size={16} />;
    } else if (url.includes('soundcloud.com')) {
      return <Music className="text-orange-500 ml-2" size={16} />;
    } else if (url.includes('suno.com')) {
      return <Music className="text-purple-500 ml-2" size={16} />;
    }
    return null;
  };
  
  const filteredMultimedia = multimedia.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">Videos & Songs</h1>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Multimedia
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
            placeholder="Search multimedia by title, book, or description..."
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
            <h3 className="font-semibold">Error loading multimedia</h3>
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
          <p className="text-primary-600">Loading multimedia content...</p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMultimedia.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24">
                          <img 
                            className="h-16 w-24 object-cover rounded-md" 
                            src={item.thumbnail} 
                            alt={item.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center text-sm font-medium text-primary-800">
                            {item.title}
                            {getUrlPlatformIcon(item.url)}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 mt-1">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/multimedia/${item.book_id}`}
                        className="text-sm text-primary-700 hover:text-primary-500 hover:underline"
                      >
                        {item.bookTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.type === 'video' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'audio' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a 
                          href={item.url} 
                          className="text-gray-500 hover:text-primary-600"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button 
                          onClick={() => handleEditMultimedia(item)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMultimedia(item.id)}
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
          
          {filteredMultimedia.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No multimedia content found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Add Multimedia Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 font-display text-primary-800">Add New Multimedia</h2>
            
            <form onSubmit={handleUploadMultimedia} className="space-y-4">
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
                  Content Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  placeholder="Enter content title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={newContent.description}
                  onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                  placeholder="Enter a brief description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newContent.type}
                  onChange={(e) => setNewContent({...newContent, type: e.target.value as 'video' | 'audio'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
                
                <div className="mt-2 text-xs text-gray-500">
                  {newContent.type === 'video' ? (
                    <p className="flex items-start">
                      <span className="text-blue-500 mr-1">Tip:</span> 
                      You can add YouTube or Vimeo links, or direct MP4 URLs
                    </p>
                  ) : (
                    <p className="flex items-start">
                      <span className="text-purple-500 mr-1">Tip:</span> 
                      You can add Suno.ai, Spotify, SoundCloud links, or direct audio URLs
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={newContent.url}
                  onChange={(e) => setNewContent({...newContent, url: e.target.value})}
                  placeholder={newContent.type === 'video' 
                    ? "https://www.youtube.com/watch?v=..." 
                    : "https://suno.com/song/..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-amber-600 mt-1">
                  {newContent.type === 'video' ? (
                    <>
                      Supported formats: YouTube videos, Vimeo videos, or direct MP4 URLs
                      <br />
                      Example: https://www.youtube.com/watch?v=20-3SconM1k
                    </>
                  ) : (
                    <>
                      Supported formats: Suno.ai songs, Spotify tracks, SoundCloud songs, or direct MP3 URLs
                      <br />
                      Example: https://suno.com/song/34bf2c2f-9113-4aab-ab4b-cd7770ee86f7
                    </>
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={newContent.thumbnail}
                  onChange={(e) => setNewContent({...newContent, thumbnail: e.target.value})}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-amber-600 mt-1">
                  Enter a URL for the thumbnail image. You can use Unsplash images, for example:
                  <br />
                  https://images.unsplash.com/photo-1611162616475-46b635cb6868
                </p>
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
                      Adding...
                    </>
                  ) : (
                    'Add Multimedia'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Multimedia Modal */}
      {editModalOpen && editingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 font-display text-primary-800">Edit Multimedia</h2>
            
            <form onSubmit={handleUpdateMultimedia} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={editingContent.title}
                  onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                  placeholder="Enter content title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={editingContent.description}
                  onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                  placeholder="Enter a brief description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={editingContent.type}
                  onChange={(e) => setEditingContent({...editingContent, type: e.target.value as 'video' | 'audio'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={editingContent.url}
                  onChange={(e) => setEditingContent({...editingContent, url: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <div className="mt-1">
                  <p className="text-xs text-amber-600">
                    {editingContent.type === 'video' ? (
                      <>YouTube, Vimeo, or direct video links supported</>
                    ) : (
                      <>Suno.ai, Spotify, SoundCloud, or direct audio links supported</>
                    )}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span className="mr-1">Current:</span> 
                    {getUrlPlatformIcon(editingContent.url)}
                    <span className="ml-1 truncate">{editingContent.url}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={editingContent.thumbnail}
                  onChange={(e) => setEditingContent({...editingContent, thumbnail: e.target.value})}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Current Thumbnail:</p>
                  <img 
                    src={editingContent.thumbnail} 
                    alt="Thumbnail Preview" 
                    className="mt-1 h-24 object-cover rounded-md border border-gray-200"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingContent(null);
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
                    'Update Multimedia'
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

export default AdminMultimedia;