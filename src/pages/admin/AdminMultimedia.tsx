import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Video, FileIcon, Trash, Edit, Plus, Search, Loader, AlertCircle, Youtube, Headphones, ExternalLink, List, Grid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabase';
import { uploadFileToStorage } from '../../lib/supabase';
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
  lyrics?: string;
}

const AdminMultimedia: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multimedia, setMultimedia] = useState<MultimediaContent[]>([]);
  const [allBooks, setAllBooks] = useState<{id: string; title: string}[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form state for new multimedia upload
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'audio',
    url: '',
    contentFile: null as File | null,
    thumbnail: '',
    thumbnailFile: null as File | null,
    lyrics: ''
  });
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<MultimediaContent & {
    contentFile: File | null;
    thumbnailFile: File | null;
  } | null>(null);
  
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
    
    // Check if we have either a URL or a file for both content and thumbnail
    const hasContentSource = newContent.url || newContent.contentFile;
    const hasThumbnailSource = newContent.thumbnail || newContent.thumbnailFile;
    
    if (!newContent.title || !newContent.description || !hasContentSource || !hasThumbnailSource) {
      alert('Please provide a title, description, and either a URL or file upload for both content and thumbnail');
      return;
    }
    
    try {
      setIsUploading(true);
      
      let contentUrl = newContent.url;
      let thumbnailUrl = newContent.thumbnail;
      
      // Handle content file upload if provided
      if (newContent.contentFile) {
        try {
          console.log('[MULTIMEDIA_UPLOAD] Uploading content file');
          // Use 'materials' bucket for content files
          contentUrl = await uploadFileToStorage(newContent.contentFile, 'materials', 'multimedia');
          console.log('[MULTIMEDIA_UPLOAD] Content file uploaded successfully:', contentUrl);
        } catch (error: unknown) {
          console.error('[MULTIMEDIA_UPLOAD] Error uploading content file:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`Error uploading content file: ${errorMessage}`);
          // Continue with the URL if provided, otherwise return
          if (!newContent.url) {
            setIsUploading(false);
            return;
          }
        }
      }
      
      // Handle thumbnail file upload if provided
      if (newContent.thumbnailFile) {
        try {
          console.log('[MULTIMEDIA_UPLOAD] Uploading thumbnail file');
          // Use 'covers' bucket for thumbnail images
          thumbnailUrl = await uploadFileToStorage(newContent.thumbnailFile, 'covers', 'thumbnails');
          console.log('[MULTIMEDIA_UPLOAD] Thumbnail file uploaded successfully:', thumbnailUrl);
        } catch (error: unknown) {
          console.error('[MULTIMEDIA_UPLOAD] Error uploading thumbnail file:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`Error uploading thumbnail file: ${errorMessage}`);
          // Continue with the URL if provided, otherwise return
          if (!newContent.thumbnail) {
            setIsUploading(false);
            return;
          }
        }
      }
      
      // Save the multimedia to the database
      await createMultimedia({
        book_id: selectedBook,
        title: newContent.title,
        description: newContent.description,
        type: newContent.type,
        url: contentUrl,
        thumbnail: thumbnailUrl,
        ...(newContent.type === 'audio' && newContent.lyrics ? { lyrics: newContent.lyrics } : {})
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
        url: contentUrl,
        thumbnail: thumbnailUrl,
        ...(newContent.type === 'audio' && newContent.lyrics ? { lyrics: newContent.lyrics } : {})
      };
      
      setMultimedia([newItem, ...multimedia]);
      
      // Reset form and close modal
      setNewContent({
        title: '',
        description: '',
        type: 'video',
        url: '',
        contentFile: null,
        thumbnail: '',
        thumbnailFile: null,
        lyrics: ''
      });
      setSelectedBook('');
      setUploadModalOpen(false);
      
      // Reload data to get proper IDs
      loadData();
      
    } catch (err: unknown) {
      console.error('Error uploading multimedia:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Failed to upload multimedia: ' + errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleEditMultimedia = (item: MultimediaContent) => {
    setEditingContent({
      ...item,
      contentFile: null,
      thumbnailFile: null
    });
    setEditModalOpen(true);
  };
  
  const handleUpdateMultimedia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingContent) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      let contentUrl = editingContent.url;
      let thumbnailUrl = editingContent.thumbnail;
      
      // Handle content file upload if provided
      if (editingContent.contentFile) {
        try {
          console.log('[MULTIMEDIA_UPDATE] Uploading content file');
          // Use 'materials' bucket for content files
          contentUrl = await uploadFileToStorage(editingContent.contentFile, 'materials', 'multimedia');
          console.log('[MULTIMEDIA_UPDATE] Content file uploaded successfully:', contentUrl);
        } catch (error: unknown) {
          console.error('[MULTIMEDIA_UPDATE] Error uploading content file:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`Error uploading content file: ${errorMessage}`);
          // Continue with the existing URL
        }
      }
      
      // Handle thumbnail file upload if provided
      if (editingContent.thumbnailFile) {
        try {
          console.log('[MULTIMEDIA_UPDATE] Uploading thumbnail file');
          // Use 'covers' bucket for thumbnail images
          thumbnailUrl = await uploadFileToStorage(editingContent.thumbnailFile, 'covers', 'thumbnails');
          console.log('[MULTIMEDIA_UPDATE] Thumbnail file uploaded successfully:', thumbnailUrl);
        } catch (error: unknown) {
          console.error('[MULTIMEDIA_UPDATE] Error uploading thumbnail file:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`Error uploading thumbnail file: ${errorMessage}`);
          // Continue with the existing URL
        }
      }
      
      // Update the multimedia in the database
      await updateMultimedia(editingContent.id, {
        title: editingContent.title,
        description: editingContent.description,
        type: editingContent.type,
        url: contentUrl,
        thumbnail: thumbnailUrl,
        ...(editingContent.type === 'audio' && editingContent.lyrics !== undefined ? { lyrics: editingContent.lyrics } : {})
      });
      
      // Update UI with the new URLs
      const updatedContent = {
        ...editingContent,
        url: contentUrl,
        thumbnail: thumbnailUrl
      };
      
      setMultimedia(multimedia.map(item => 
        item.id === editingContent.id ? updatedContent : item
      ));
      
      // Close modal
      setEditModalOpen(false);
      setEditingContent(null);
      
    } catch (err: unknown) {
      console.error('Error updating multimedia:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('Failed to update multimedia: ' + errorMessage);
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
      {/* Header section - moved to top for proper loading order */}
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
      
      {/* Search and view controls */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
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
          
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 self-end">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}
              aria-label="Table view"
              title="Table view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center p-2 rounded-md ${viewMode === 'card' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}
              aria-label="Card view"
              title="Card view"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Error state - moved up to be immediately visible */}
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
      
      {/* Loading state - moved up for better UX */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading multimedia content...</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table - main content */
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
                          title="Open content URL"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button 
                          onClick={() => handleEditMultimedia(item)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit content"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMultimedia(item.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete content"
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
      ) : (
        /* Card view - better for seeing all fields */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMultimedia.length > 0 ? (
            filteredMultimedia.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-48 object-cover" 
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.type === 'video' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'audio' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-primary-800 truncate">{item.title}</h3>
                    {getUrlPlatformIcon(item.url)}
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Book:</span>
                    <Link 
                      to={`/multimedia/${item.book_id}`}
                      className="ml-2 text-sm text-primary-700 hover:text-primary-500 hover:underline"
                    >
                      {item.bookTitle}
                    </Link>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  </div>
                  
                  {item.type === 'audio' && item.lyrics && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase">Lyrics:</span>
                      <div className="mt-1 text-sm text-gray-700 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded border border-gray-100">
                        <p className="whitespace-pre-line">{item.lyrics}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <a 
                      href={item.url} 
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center"
                      target="_blank"
                      rel="noreferrer"
                      title="Open content URL"
                    >
                      <ExternalLink size={16} className="mr-1" />
                      Open URL
                    </a>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditMultimedia(item)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                        title="Edit content"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMultimedia(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        title="Delete content"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No multimedia content found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Modals - kept at the bottom since they're only shown when needed */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold font-display text-primary-800">Add New Multimedia</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  newContent.type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {newContent.type.toUpperCase()}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleUploadMultimedia} className="grid grid-cols-12 gap-6">

              
              <div className="col-span-12 lg:col-span-6">
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
              
              <div className="col-span-12 lg:col-span-6">
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
              
              {newContent.type === 'audio' && (
                <div className="col-span-12 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Music size={16} className="mr-2 text-purple-500" />
                    Lyrics
                  </label>
                  <textarea 
                    value={newContent.lyrics}
                    onChange={(e) => setNewContent({...newContent, lyrics: e.target.value})}
                    placeholder="Enter lyrics for the audio content (optional)"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Add song lyrics here. Line breaks will be preserved when displayed.</p>
                </div>
              )}
              
              <div className="col-span-6 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={newContent.type}
                  onChange={(e) => setNewContent({...newContent, type: e.target.value as 'video' | 'audio'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  aria-label="Select content type"
                  title="Select content type"
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
              
              <div className="col-span-6 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Book <span className="text-red-500">*</span>
                </label>
                <select 
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  aria-label="Select a book"
                  title="Select a book"
                >
                  <option value="">Select a book</option>
                  {allBooks.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL 
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
                <div className="mt-2">
                  <label htmlFor="content-file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Content File
                  </label>
                  <input 
                    id="content-file-upload"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewContent({...newContent, contentFile: e.target.files[0]});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-describedby="content-file-help"
                  />
                  <p id="content-file-help" className="mt-1 text-xs text-gray-500">
                    {newContent.contentFile ? `Selected file: ${newContent.contentFile.name}` : 'Upload a file for content'}
                  </p>
                </div>
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL 
                </label>
                <input 
                  type="text"
                  value={newContent.thumbnail}
                  onChange={(e) => setNewContent({...newContent, thumbnail: e.target.value})}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-amber-600 mt-1">
                  Enter a URL for the thumbnail image. You can use Unsplash images, for example:
                  <br />
                  https://images.unsplash.com/photo-1611162616475-46b635cb6868
                </p>
                <div className="mt-2">
                  <label htmlFor="thumbnail-file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Thumbnail File
                  </label>
                  <input 
                    id="thumbnail-file-upload"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewContent({...newContent, thumbnailFile: e.target.files[0]});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-describedby="thumbnail-file-help"
                  />
                  <p id="thumbnail-file-help" className="mt-1 text-xs text-gray-500">
                    {newContent.thumbnailFile ? `Selected file: ${newContent.thumbnailFile.name}` : 'Upload a file for thumbnail'}
                  </p>
                </div>
              </div>
              
              <div className="col-span-12 border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-end space-x-3">
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
                    className={`px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center ${
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
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Multimedia Modal */}
      {editModalOpen && editingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold font-display text-primary-800">Edit Multimedia</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  editingContent.type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {editingContent.type.toUpperCase()}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleUpdateMultimedia} className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6">
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
              
              <div className="col-span-12 lg:col-span-6">
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
              
              {editingContent.type === 'audio' && (
                <div className="col-span-12 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Music size={16} className="mr-2 text-purple-500" />
                    Lyrics
                  </label>
                  <textarea 
                    value={editingContent.lyrics || ''}
                    onChange={(e) => setEditingContent({...editingContent, lyrics: e.target.value})}
                    placeholder="Enter lyrics for the audio content (optional)"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Add song lyrics here. Line breaks will be preserved when displayed.</p>
                </div>
              )}
              
              <div className="col-span-6 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={editingContent.type}
                  onChange={(e) => setEditingContent({...editingContent, type: e.target.value as 'video' | 'audio'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  aria-label="Select content type"
                  title="Select content type"
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL 
                </label>
                <input 
                  type="text"
                  value={editingContent.url}
                  onChange={(e) => setEditingContent({...editingContent, url: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                <div className="mt-2">
                  <label htmlFor="content-file-upload-edit" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload New Content File
                  </label>
                  <input 
                    id="content-file-upload-edit"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditingContent({...editingContent, contentFile: e.target.files[0]});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-describedby="content-file-help-edit"
                  />
                  <p id="content-file-help-edit" className="mt-1 text-xs text-gray-500">
                    {editingContent.contentFile ? `Selected file: ${editingContent.contentFile.name}` : 'Upload a new file for content'}
                  </p>
                </div>
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL 
                </label>
                <input 
                  type="text"
                  value={editingContent.thumbnail}
                  onChange={(e) => setEditingContent({...editingContent, thumbnail: e.target.value})}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Current Thumbnail:</p>
                  <img 
                    src={editingContent.thumbnail} 
                    alt="Thumbnail Preview" 
                    className="mt-1 h-24 object-cover rounded-md border border-gray-200"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="thumbnail-file-upload-edit" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload New Thumbnail File
                  </label>
                  <input 
                    id="thumbnail-file-upload-edit"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditingContent({...editingContent, thumbnailFile: e.target.files[0]});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-describedby="thumbnail-file-help-edit"
                  />
                  <p id="thumbnail-file-help-edit" className="mt-1 text-xs text-gray-500">
                    {editingContent.thumbnailFile ? `Selected file: ${editingContent.thumbnailFile.name}` : 'Upload a new file for thumbnail'}
                  </p>
                </div>
              </div>
              
              <div className="col-span-12 border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-end space-x-3">
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
                    className={`px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center ${
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMultimedia;