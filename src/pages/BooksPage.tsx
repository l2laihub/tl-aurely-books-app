import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { Search, Filter, Sparkles, Loader, AlertCircle } from 'lucide-react';
import { getAllBooks } from '../services/bookService';

const BooksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [allAgeRanges, setAllAgeRanges] = useState<string[]>([]);
  
  useEffect(() => {
    loadBooks();
  }, []);
  
  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const booksData = await getAllBooks();
      setBooks(booksData);
      
      // Extract unique genres and age ranges
      const genresSet = new Set<string>();
      const ageRangesSet = new Set<string>();
      
      booksData.forEach(book => {
        book.genre.forEach((genre: string) => genresSet.add(genre));
        ageRangesSet.add(book.ageRange);
      });
      
      setAllGenres(Array.from(genresSet).sort());
      setAllAgeRanges(Array.from(ageRangesSet).sort());
      
    } catch (err: any) {
      console.error('Error loading books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter books based on search, genre and age
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === '' || book.genre.includes(selectedGenre);
    const matchesAge = selectedAge === '' || book.ageRange === selectedAge;
    
    return matchesSearch && matchesGenre && matchesAge;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl max-w-md w-full">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Error loading books</h3>
          <p className="text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={loadBooks}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 min-h-screen">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-[10%]">
          <Sparkles size={24} className="text-accent-300 animate-pulse" />
        </div>
        <div className="absolute bottom-10 right-[20%]">
          <Sparkles size={24} className="text-accent-300 animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">Explore Our Book Collection</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover T.L. Aurely's world of educational adventures for young readers!
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10 border-2 border-primary-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-primary-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title or keyword..."
                className="pl-10 pr-4 py-3 w-full border-2 border-primary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={20} className="text-primary-400" />
              </div>
              <select
                className="pl-10 pr-4 py-3 w-full border-2 border-primary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Topics</option>
                {allGenres.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-primary-400">Age</span>
              </div>
              <select
                className="pl-16 pr-4 py-3 w-full border-2 border-primary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
              >
                <option value="">All Ages</option>
                {allAgeRanges.map((ageRange, index) => (
                  <option key={index} value={ageRange}>
                    {ageRange}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-8">
          <p className="text-primary-700 font-medium">
            Showing {filteredBooks.length} of {books.length} books
            {selectedGenre && ` in ${selectedGenre}`}
            {selectedAge && ` for ${selectedAge}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1616583936499-12264acc9532?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80" 
              alt="Sad book character"
              className="w-32 h-32 object-cover rounded-full mx-auto mb-6 border-4 border-primary-200"
            />
            <h3 className="text-xl font-semibold mb-2 font-display text-primary-800">No books found</h3>
            <p className="text-primary-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('');
                setSelectedAge('');
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;