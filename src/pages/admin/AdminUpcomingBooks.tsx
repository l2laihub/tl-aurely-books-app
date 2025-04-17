import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus, Search, Calendar, ExternalLink, Loader, AlertCircle } from 'lucide-react';
import { getAllUpcomingBooks, deleteUpcomingBook } from '../../services/upcomingBookService';
import { UpcomingBook } from '../../types/UpcomingBook';
import { useAuth } from '../../context/AuthContext';

const AdminUpcomingBooks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [upcomingBooks, setUpcomingBooks] = useState<UpcomingBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

  const handleDeleteUpcomingBook = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this upcoming book? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      await deleteUpcomingBook(id);
      setUpcomingBooks(upcomingBooks.filter(book => book.id !== id));
    } catch (err: any) {
      console.error('Error deleting upcoming book:', err);
      alert('Failed to delete upcoming book. Please try again.');
    } finally {
      setIsDeleting(null);
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

  const filteredBooks = upcomingBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">Manage Upcoming Books</h1>
        <Link
          to="/admin/upcoming-books/new"
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Upcoming Book
        </Link>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search upcoming books by title or author..."
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
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading upcoming books...</p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Release
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pre-order Link
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-12">
                          <img 
                            className="h-16 w-12 object-cover rounded" 
                            src={book.coverImageUrl} 
                            alt={book.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-800">{book.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-primary-500" />
                        {formatDate(book.expectedReleaseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.preorderUrl ? (
                        <a 
                          href={book.preorderUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Pre-order Link
                        </a>
                      ) : (
                        <span className="text-gray-400">No link available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/admin/upcoming-books/edit/${book.id}`} 
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteUpcomingBook(book.id)}
                          disabled={isDeleting === book.id}
                          className={`text-red-500 hover:text-red-700 ${isDeleting === book.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isDeleting === book.id ? (
                            <Loader size={18} className="animate-spin" />
                          ) : (
                            <Trash size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBooks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming books found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUpcomingBooks;