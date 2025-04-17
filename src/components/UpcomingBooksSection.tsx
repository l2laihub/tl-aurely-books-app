import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Loader, AlertCircle } from 'lucide-react';
import { getAllUpcomingBooks } from '../services/upcomingBookService';
import { UpcomingBook } from '../types/UpcomingBook';

const UpcomingBooksSection: React.FC = () => {
  const [upcomingBooks, setUpcomingBooks] = useState<UpcomingBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUpcomingBooks();
  }, []);

  const loadUpcomingBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const booksData = await getAllUpcomingBooks();
      setUpcomingBooks(booksData);
    } catch (err: any) {
      console.error('Error loading upcoming books:', err);
      setError('Failed to load upcoming books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={30} className="animate-spin text-primary-600 mr-2" />
        <p className="text-primary-600">Loading upcoming books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl my-6 flex items-start">
        <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold">Error loading upcoming books</h3>
          <p>{error}</p>
          <button 
            onClick={loadUpcomingBooks}
            className="mt-2 text-red-700 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (upcomingBooks.length === 0) {
    return null; // Don't show the section if there are no upcoming books
  }

  return (
    <section className="bg-gradient-to-r from-primary-50 to-secondary-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center font-display text-primary-800">Coming Soon</h2>
          <div className="w-24 h-1 bg-accent-400 mx-auto mt-4"></div>
          <p className="text-center text-primary-700 mt-4 max-w-2xl mx-auto">
            Get a sneak peek at our upcoming books and be the first to know when they're available!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingBooks.map(book => (
            <div key={book.id} className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-primary-100 hover:border-accent-300 transition-colors">
              <div className="h-64 overflow-hidden">
                <img 
                  src={book.coverImageUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 font-display text-primary-800">{book.title}</h3>
                <p className="text-primary-700 mb-2">by {book.author}</p>
                <div className="flex items-center text-primary-600 mb-4">
                  <Calendar size={18} className="mr-2" />
                  <span>Expected: {formatDate(book.expectedReleaseDate)}</span>
                </div>
                <p className="text-primary-700 mb-4 line-clamp-3">{book.description}</p>
                {book.preorderUrl && (
                  <a 
                    href={book.preorderUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-accent-600 hover:text-accent-500 font-medium"
                  >
                    <ExternalLink size={18} className="mr-1" />
                    Pre-order Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingBooksSection;