import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus, Search, Eye, AlertCircle, Loader } from 'lucide-react';
import { getAllBooks, deleteBook } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';

const AdminBooks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const booksData = await getAllBooks();
      setBooks(booksData);
    } catch (err: any) {
      console.error('Error loading books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      await deleteBook(id);
      setBooks(books.filter(book => book.id !== id));
    } catch (err: any) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredBooks = books.filter(book => 
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
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">Manage Books</h1>
        <Link
          to="/admin/books/new"
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Book
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
            placeholder="Search books by title or author..."
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
            <h3 className="font-semibold">Error loading books</h3>
            <p>{error}</p>
            <button 
              onClick={loadBooks}
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
          <p className="text-primary-600">Loading books...</p>
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
                    Age Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materials
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
                            src={book.coverImage} 
                            alt={book.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-800">{book.title}</div>
                          <div className="text-sm text-gray-500">by {book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {book.ageRange}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.publishDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.downloadMaterials?.length || 0} files
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/book/${book.id}`} 
                          className="text-gray-500 hover:text-primary-600"
                          target="_blank"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/books/edit/${book.id}`} 
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
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
              <p className="text-gray-500">No books found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBooks;