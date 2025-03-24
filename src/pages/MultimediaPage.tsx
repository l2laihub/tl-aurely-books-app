import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookById } from '../services/bookService';
import { getMultimediaByBookId, initializeMultimediaData, getValidVimeoId } from '../services/multimediaService';
import VideoPlayer from '../components/VideoPlayer';
import AudioPlayer from '../components/AudioPlayer';
import { ArrowLeft, Video, Music, Star, BookOpen, Loader, PlusCircle, ExternalLink } from 'lucide-react';

interface MultimediaContent {
  id: string;
  type: 'video' | 'audio';
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

interface BookData {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  ageRange: string;
}

const MultimediaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multimedia, setMultimedia] = useState<MultimediaContent[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('audio');
  
  useEffect(() => {
    const loadBookAndMultimedia = async (bookId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load book data
        const bookData = await getBookById(bookId);
        setBook(bookData);
        
        // Initialize multimedia table if needed (for demo purposes)
        await initializeMultimediaData();
        
        // Load multimedia data from the database
        const multimediaData = await getMultimediaByBookId(bookId);
        
        // Fix any problematic Vimeo URLs for demo purposes
        const fixedMultimediaData = multimediaData.map(item => {
          if (item.type === 'video' && item.url.includes('vimeo.com')) {
            // Fix Vimeo URL if it has an invalid ID
            const validId = getValidVimeoId(item.url);
            return {
              ...item,
              url: `https://vimeo.com/${validId}`
            };
          }
          return item;
        });
        
        // If we got data back, use it
        if (fixedMultimediaData && fixedMultimediaData.length > 0) {
          console.log("Using multimedia data from database:", fixedMultimediaData);
          setMultimedia(fixedMultimediaData);
        } else {
          console.log("No multimedia found in database, using sample data");
          // For demo/testing, we'll provide some examples if none exist in the database
          setMultimedia(getSampleMultimedia(bookId));
        }
      } catch (err) {
        console.error('Error loading multimedia page:', err);
        setError('Failed to load multimedia content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadBookAndMultimedia(id);
    }
  }, [id]);
  
  // Sample multimedia content for demonstration
  const getSampleMultimedia = (bookId: string): MultimediaContent[] => {
    return [
      {
        id: `${bookId}-video-1`,
        type: 'video',
        title: 'Book Introduction',
        description: 'A short introduction to the characters and story.',
        url: 'https://www.youtube.com/watch?v=20-3SconM1k', // YouTube example
        thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: `${bookId}-video-2`,
        type: 'video',
        title: 'Animated Story - Chapter 1',
        description: 'The first chapter of the story animated for young viewers.',
        url: 'https://vimeo.com/824804225', // Valid Vimeo example
        thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3710bc10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: `${bookId}-video-3`,
        type: 'video',
        title: 'Reading Time with the Author',
        description: 'Listen to the author read this delightful story.',
        url: 'https://www.youtube.com/watch?v=CvG3JX8XidQ', // Another YouTube example
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: `${bookId}-audio-1`,
        type: 'audio',
        title: 'Theme Song',
        description: 'The catchy theme song that accompanies the book.',
        url: 'https://suno.com/song/34bf2c2f-9113-4aab-ab4b-cd7770ee86f7?sh=87tU5y6ZXlkWWJoz', // Suno.ai example
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: `${bookId}-audio-2`,
        type: 'audio',
        title: 'Bedtime Audio Book',
        description: 'Listen to the complete story narrated by the author.',
        url: 'https://soundcloud.com/user-861303933/relaxing-sleep-music', // SoundCloud example
        thumbnail: 'https://images.unsplash.com/photo-1519552928909-67ca7aef9265?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: `${bookId}-audio-3`,
        type: 'audio',
        title: 'Sing-along Songs',
        description: 'Fun songs from the book to sing along with your child.',
        url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT', // Spotify example
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ];
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600 font-body">Loading multimedia content...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 font-display text-primary-800">
          {error || "Content not found"}
        </h2>
        <p className="mb-8 text-primary-600 font-body">Sorry, we couldn't find the multimedia content you're looking for.</p>
        <Link 
          to="/books" 
          className="inline-flex items-center bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Books
        </Link>
      </div>
    );
  }

  const videos = multimedia.filter(item => item.type === 'video');
  const audios = multimedia.filter(item => item.type === 'audio');

  // Function to get thumbnail or use book cover as fallback
  const getThumbnail = (item: MultimediaContent) => {
    return item.thumbnail || book.coverImage;
  };

  return (
    <div className="bg-primary-50 min-h-screen relative">
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-32 h-24 bg-secondary-200 opacity-20 rounded-bubble animate-float hidden lg:block" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute bottom-40 right-10 w-32 h-24 bg-primary-200 opacity-20 rounded-bubble animate-float hidden lg:block" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-[10%] animate-float" style={{ animationDelay: "0.5s" }}>
          <Star size={24} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.3s" }} />
        </div>
        <div className="absolute bottom-10 right-[20%] animate-float" style={{ animationDelay: "0.9s" }}>
          <Star size={24} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.7s" }} />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            {book.title}: Interactive Content
          </h1>
          <p className="text-xl max-w-2xl mx-auto font-body">
            Explore videos, songs, and interactive materials related to {book.title}!
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            to={`/book/${id}`} 
            className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors font-body"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to book details
          </Link>
        </div>

        {/* Book Summary */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-10 border-4 border-primary-200 hover:border-accent-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center space-x-6">
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="w-24 h-36 object-cover rounded-lg shadow-md border-2 border-primary-300"
            />
            <div>
              <h2 className="text-2xl font-bold mb-2 font-display text-primary-800">{book.title}</h2>
              <p className="text-primary-600 mb-2 font-body">by {book.author}</p>
              <div className="flex items-center text-sm text-primary-500 font-body">
                <BookOpen size={16} className="mr-1" />
                <span>For ages {book.ageRange}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-8" role="tablist" aria-label="Multimedia content">
          <button
            className={`py-4 px-6 font-medium text-lg font-display flex items-center transition-all duration-300 border-b-2 ${
              activeTab === 'audio'
                ? 'border-secondary-600 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-primary-600 hover:border-secondary-300'
            }`}
            onClick={() => setActiveTab('audio')}
            aria-selected={activeTab === 'audio' ? 'true' : 'false'}
            role="tab"
            aria-controls="audio-panel"
            id="audio-tab"
            title="Show songs and audio"
          >
            <Music size={20} className={`mr-2 ${activeTab === 'audio' ? 'text-secondary-600' : 'text-gray-400'}`} aria-hidden="true" />
            <span>Songs & Audio</span>
            {audios.length > 0 && (
              <span className="ml-2 bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {audios.length}
              </span>
            )}
          </button>
          
          <button
            className={`py-4 px-6 font-medium text-lg font-display flex items-center transition-all duration-300 border-b-2 ${
              activeTab === 'video'
                ? 'border-primary-600 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-primary-600 hover:border-primary-300'
            }`}
            onClick={() => setActiveTab('video')}
            aria-selected={activeTab === 'video' ? 'true' : 'false'}
            role="tab"
            aria-controls="video-panel"
            id="video-tab"
            title="Show videos and animations"
          >
            <Video size={20} className={`mr-2 ${activeTab === 'video' ? 'text-primary-600' : 'text-gray-400'}`} aria-hidden="true" />
            <span>Videos & Animations</span>
            {videos.length > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {videos.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Audio Tab Panel */}
        <div 
          id="audio-panel"
          role="tabpanel"
          aria-labelledby="audio-tab"
          className={`transition-opacity duration-300 ${activeTab === 'audio' ? 'block' : 'hidden'}`}
        >
          {audios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {audios.map(audio => (
                <AudioPlayer 
                  key={audio.id}
                  title={audio.title}
                  description={audio.description}
                  audioUrl={audio.url}
                  imageUrl={getThumbnail(audio)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md p-8 text-center border-2 border-secondary-100">
              <Music size={40} className="mx-auto text-secondary-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">No audio available</h3>
              <p className="text-primary-600 mb-4 font-body">There are currently no audio clips or songs for this book.</p>
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/admin/multimedia"
                  className="inline-flex items-center bg-secondary-600 hover:bg-secondary-500 text-white py-2 px-4 rounded-full transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add Audio in Admin
                </Link>
                <Link 
                  to={`/book/${id}`}
                  className="inline-flex items-center bg-white border border-secondary-600 text-secondary-600 hover:bg-secondary-50 py-2 px-4 rounded-full transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ExternalLink size={16} className="mr-1" />
                  Back to Book
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Video Tab Panel */}
        <div 
          id="video-panel"
          role="tabpanel"
          aria-labelledby="video-tab"
          className={`transition-opacity duration-300 ${activeTab === 'video' ? 'block' : 'hidden'}`}
        >
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map(video => (
                <VideoPlayer 
                  key={video.id}
                  title={video.title}
                  description={video.description}
                  videoUrl={video.url}
                  thumbnailUrl={getThumbnail(video)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md p-8 text-center border-2 border-primary-100">
              <Video size={40} className="mx-auto text-primary-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">No videos available</h3>
              <p className="text-primary-600 mb-4 font-body">There are currently no videos for this book.</p>
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/admin/multimedia"
                  className="inline-flex items-center bg-primary-600 hover:bg-primary-500 text-white py-2 px-4 rounded-full transition-all duration-300 transform hover:-translate-y-1"
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add Videos in Admin
                </Link>
                <Link 
                  to={`/book/${id}`}
                  className="inline-flex items-center bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 py-2 px-4 rounded-full transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ExternalLink size={16} className="mr-1" />
                  Back to Book
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Call to Action */}
        <div className="bg-gradient-to-r from-cream-50 to-cream-100 rounded-3xl p-8 text-center mt-16 border-2 border-cream-200 shadow-md transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Want to explore more books?</h3>
          <p className="text-charcoal-700 mb-6 font-body">
            Check out our other wonderful books and their interactive content!
          </p>
          <Link 
            to="/books" 
            className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            Browse All Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MultimediaPage;