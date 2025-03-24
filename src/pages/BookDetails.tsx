import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookById } from '../services/bookService';
import DownloadCard from '../components/DownloadCard';
import { Calendar, Book, FileText, ArrowLeft, Star, Download, Video, Music, Loader, ShoppingCart } from 'lucide-react';

// Define types for book and material
interface BookType {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publishDate: string;
  isbn: string;
  pages: number;
  ageRange: string;
  genres: string[];
  amazonLink?: string;
  reviewLink?: string;
  downloadMaterials?: MaterialType[];
}

interface MaterialType {
  id: string;
  book_id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize: string;
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const bookData = await getBookById(id);
        setBook(bookData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600 font-body">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 font-display text-primary-800">
          {error || "Book not found"}
        </h2>
        <p className="mb-8 text-primary-600 font-body">Sorry, we couldn't find the book you're looking for.</p>
        <Link 
          to="/books" 
          className="inline-flex items-center bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Navigation link - moved to top */}
        <Link 
          to="/books" 
          className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-8 transition-colors font-body"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to all books
        </Link>
        
        {/* Book Details - main content moved to top */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12 border-4 border-primary-200 transition-all duration-300 hover:border-accent-300 hover:shadow-xl">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-primary-100 to-secondary-100 flex justify-center items-center p-8">
              <div className="relative">
                <div className="absolute -inset-2 bg-accent-300 rounded-2xl transform rotate-6 transition-all duration-300 hover:rotate-0"></div>
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`}
                    className="relative rounded-2xl shadow-lg max-h-[500px] object-cover z-10"
                  />
                ) : (
                  <div className="relative rounded-2xl shadow-lg max-h-[500px] bg-gray-200 flex items-center justify-center z-10 w-[300px] h-[450px]">
                    <FileText size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3 p-8">
              <div className="bg-accent-500 text-white px-3 py-1 rounded-full inline-block mb-4 font-medium shadow-md">
                For ages {book.ageRange || 'All'}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 font-display text-primary-800">{book.title}</h1>
              <p className="text-xl text-primary-600 mb-4 font-body">by {book.author}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {book.genres && book.genres.length > 0 && book.genres.map((genre: string, index: number) => (
                  <span 
                    key={index}
                    className="text-sm px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full font-body"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center font-body">
                  <Calendar size={20} className="text-primary-600 mr-2" />
                  <span>Published: {book.publishDate}</span>
                </div>
                <div className="flex items-center font-body">
                  <Book size={20} className="text-primary-600 mr-2" />
                  <span>{book.pages} pages</span>
                </div>
                <div className="flex items-center font-body">
                  <FileText size={20} className="text-primary-600 mr-2" />
                  <span>ISBN: {book.isbn}</span>
                </div>
              </div>
              
              {/* External Links Section */}
              {(book.amazonLink || book.reviewLink) && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {book.amazonLink && (
                    <a 
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                      aria-label="View on Amazon"
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      View on Amazon
                    </a>
                  )}
                  
                  {book.reviewLink && (
                    <a 
                      href={book.reviewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                      aria-label="Read Reviews"
                    >
                      <Star size={18} className="mr-2" />
                      Read Reviews
                    </a>
                  )}
                </div>
              )}
              
              <div className="border-t border-primary-100 py-6">
                <h3 className="text-xl font-semibold mb-4 font-display text-primary-800">About this book</h3>
                <p className="text-charcoal-700 leading-relaxed whitespace-pre-line font-body">
                  {book.description}
                </p>
              </div>
              
              <div className="mt-6 bg-primary-50 rounded-2xl p-6 border border-primary-100">
                <h3 className="text-lg font-semibold mb-3 flex items-center font-display">
                  <Star size={20} className="text-accent-500 mr-2" />
                  Learning Benefits
                </h3>
                <ul className="list-disc list-inside space-y-2 text-charcoal-700 font-body">
                  <li>Encourages curiosity and exploration</li>
                  <li>Builds vocabulary and language skills</li>
                  <li>Promotes critical thinking and problem-solving</li>
                  <li>Develops empathy and emotional intelligence</li>
                </ul>
              </div>
              
              {/* Multimedia Button */}
              <div className="mt-8">
                <Link 
                  to={`/multimedia/${book.id}`}
                  className="inline-flex items-center bg-secondary-600 hover:bg-secondary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <Video size={18} className="mr-2" />
                  <Music size={18} className="mr-2" />
                  Watch Videos & Listen to Songs
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Downloads Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 font-display text-primary-800 flex items-center">
            <Download size={24} className="mr-3 text-primary-600" />
            Fun Learning Materials
          </h2>
          <p className="text-charcoal-700 mb-8 font-body">
            Enhance your child's reading experience with these exclusive materials related to "{book.title}". Click on any item to download.
          </p>
          {book.downloadMaterials && book.downloadMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {book.downloadMaterials.map((material: MaterialType) => (
                <DownloadCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl shadow-md">
              <Download size={40} className="mx-auto text-primary-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">No materials available</h3>
              <p className="text-primary-600 mb-2 font-body">There are currently no downloadable materials for this book.</p>
              <p className="text-primary-600 font-body">Check back later or explore other books!</p>
            </div>
          )}
        </div>
        
        {/* Reading Tips */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-3xl p-8 mb-12 shadow-lg">
          <h3 className="text-xl font-bold mb-4 font-display">Reading Tips for Parents</h3>
          <div className="grid md:grid-cols-2 gap-6 font-body">
            <div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <span className="inline-block w-4 h-4 bg-accent-400 rounded-full"></span>
                  </div>
                  <p>Set aside a regular time each day for reading together</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <span className="inline-block w-4 h-4 bg-accent-400 rounded-full"></span>
                  </div>
                  <p>Ask open-ended questions about the story and characters</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <span className="inline-block w-4 h-4 bg-accent-400 rounded-full"></span>
                  </div>
                  <p>Use different voices for different characters to make the story come alive</p>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <span className="inline-block w-4 h-4 bg-accent-400 rounded-full"></span>
                  </div>
                  <p>Let your child turn the pages and point to pictures they like</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <span className="inline-block w-4 h-4 bg-accent-400 rounded-full"></span>
                  </div>
                  <p>Connect the story to your child's own experiences</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <span className="inline-block w-4 h-4 bg-accent-400 rounded-full"></span>
                  </div>
                  <p>Use the downloadable activities to extend the learning beyond the book</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Recommendation Section */}
        <div className="bg-cream-100 rounded-3xl p-8 text-center border-2 border-cream-200 shadow-md">
          <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Enjoyed this book?</h3>
          <p className="text-charcoal-700 mb-6 font-body">
            Check out more of T.L. Aurely's books and discover more exciting educational adventures!
          </p>
          <Link 
            to="/books" 
            className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            Explore More Books
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;