import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookById } from '../services/bookService';
import { getMultimediaByBookId, initializeMultimediaData, getValidVimeoId } from '../services/multimediaService';
import VideoPlayer from '../components/VideoPlayer';
import AudioPlayer from '../components/AudioPlayer';
import { ArrowLeft, Video, Music, Star, BookOpen, Loader } from 'lucide-react';

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
      {/* Header section - moved to top for proper loading order */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            {book.title}: Interactive Content
          </h1>
          <p className="text-xl max-w-2xl mx-auto font-body">
            Explore videos, songs, and interactive materials related to {book.title}!
          </p>
        </div>
        
        {/* Decorative elements - moved inside header */}
        <div className="absolute top-10 left-[10%] animate-float" style={{ animationDelay: "0.5s" }}>
          <Star size={24} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.3s" }} />
        </div>
        <div className="absolute bottom-10 right-[20%] animate-float" style={{ animationDelay: "0.9s" }}>
          <Star size={24} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.7s" }} />
        </div>
      </div>
      
      {/* Main content container */}
      <div className="container mx-auto px-4 py-12">
        {/* Navigation tabs - moved up */}
        <div className="mb-8">
          <div className="flex flex-wrap space-x-4 justify-center">
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'audio'
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-white text-primary-700 hover:bg-primary-100'
              }`}
            >
              <Music size={20} className="mr-2" />
              Audio Content
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'video'
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-white text-primary-700 hover:bg-primary-100'
              }`}
            >
              <Video size={20} className="mr-2" />
              Video Content
            </button>
          </div>
        </div>
        
        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'video' ? (
            videos.length > 0 ? (
              videos.map(video => (
                <div key={video.id} className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border-2 border-primary-100 hover:border-accent-300">
                  <div className="relative aspect-video bg-primary-100">
                    <img 
                      src={getThumbnail(video)} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-accent-500 bg-opacity-90 flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110">
                        <Video size={28} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">{video.title}</h3>
                    <p className="text-charcoal-600 mb-4 font-body">{video.description}</p>
                    <VideoPlayer 
                      title={video.title}
                      description={video.description}
                      videoUrl={video.url}
                      thumbnailUrl={getThumbnail(video)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Video size={48} className="mx-auto text-primary-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">No videos available</h3>
                <p className="text-primary-600 font-body">There are currently no videos for this book.</p>
              </div>
            )
          ) : (
            audios.length > 0 ? (
              audios.map(audio => (
                <div key={audio.id} className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border-2 border-primary-100 hover:border-accent-300">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">{audio.title}</h3>
                    <p className="text-charcoal-600 mb-4 font-body">{audio.description}</p>
                    <AudioPlayer 
                      title={audio.title}
                      description={audio.description}
                      audioUrl={audio.url}
                      imageUrl={getThumbnail(audio)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Music size={48} className="mx-auto text-primary-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">No audio available</h3>
                <p className="text-primary-600 font-body">There are currently no audio tracks for this book.</p>
              </div>
            )
          )}
        </div>
        
        {/* Back to book details button */}
        <div className="mt-12 text-center">
          <Link 
            to={`/books/${book.id}`}
            className="inline-flex items-center bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1"
          >
            <BookOpen size={18} className="mr-2" />
            Back to Book Details
          </Link>
        </div>
      </div>
      
      {/* Decorative elements - moved to bottom since they're just visual */}
      <div className="absolute top-40 left-10 w-32 h-24 bg-secondary-200 opacity-20 rounded-bubble animate-float hidden lg:block" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute bottom-40 right-10 w-32 h-24 bg-primary-200 opacity-20 rounded-bubble animate-float hidden lg:block" style={{ animationDelay: '1.5s' }}></div>
    </div>
  );
};

export default MultimediaPage;