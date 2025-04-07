import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash, Search, Book, AlertCircle, Loader, Save, X } from 'lucide-react';
import { getAllAuthors, updateAuthorName, deleteAuthor } from '../../services/authorService';
import { useAuth } from '../../context/AuthContext';
import type { AuthorData } from '../../services/authorService';

const AdminAuthors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<string | null>(null);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [processingAuthor, setProcessingAuthor] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authorsData = await getAllAuthors();
      setAuthors(authorsData);
    } catch (err: Error | unknown) {
      console.error('Error loading authors:', err);
      setError('Failed to load authors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAuthor = (authorName: string) => {
    setEditingAuthor(authorName);
    setNewAuthorName(authorName);
  };

  const handleCancelEdit = () => {
    setEditingAuthor(null);
    setNewAuthorName('');
  };

  const handleSaveAuthor = async (oldName: string) => {
    if (!newAuthorName.trim()) {
      alert('Author name cannot be empty');
      return;
    }

    if (oldName === newAuthorName) {
      setEditingAuthor(null);
      return;
    }

    try {
      setProcessingAuthor(oldName);
      await updateAuthorName(oldName, newAuthorName);
      
      // Update the local state
      setAuthors(prevAuthors => 
        prevAuthors.map(author => 
          author.id === oldName 
            ? { ...author, id: newAuthorName, name: newAuthorName } 
            : author
        )
      );
      
      setEditingAuthor(null);
    } catch (err: Error | unknown) {
      console.error('Error updating author:', err);
      alert('Failed to update author. Please try again.');
    } finally {
      setProcessingAuthor(null);
    }
  };

  const handleDeleteAuthor = async (authorName: string) => {
    if (!window.confirm(`Are you sure you want to delete the author "${authorName}"? This will remove the author from all associated books. This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingAuthor(authorName);
      await deleteAuthor(authorName);
      
      // Remove from local state
      setAuthors(prevAuthors => 
        prevAuthors.filter(author => author.id !== authorName)
      );
    } catch (err: Error | unknown) {
      console.error('Error deleting author:', err);
      alert('Failed to delete author. Please try again.');
    } finally {
      setProcessingAuthor(null);
    }
  };

  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">Manage Authors</h1>
        <div className="flex gap-4">
          <Link
            to="/admin/authors/profile"
            className="bg-accent-400 hover:bg-accent-300 text-primary-900 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
          >
            Edit Author Profile
          </Link>
        </div>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search authors by name..."
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
            <h3 className="font-semibold">Error loading authors</h3>
            <p>{error}</p>
            <button 
              onClick={loadAuthors}
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
          <p className="text-primary-600">Loading authors...</p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Books
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAuthors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingAuthor === author.id ? (
                        <input
                          type="text"
                          value={newAuthorName}
                          onChange={(e) => setNewAuthorName(e.target.value)}
                          className="w-full py-1 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          autoFocus
                          aria-label="Edit author name"
                          placeholder="Author name"
                        />
                      ) : (
                        <div className="text-sm font-medium text-primary-800">{author.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Book size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">{author.bookCount} {author.bookCount === 1 ? 'book' : 'books'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {editingAuthor === author.id ? (
                          <>
                            <button
                              onClick={() => handleSaveAuthor(author.id)}
                              disabled={processingAuthor === author.id}
                              className="text-green-500 hover:text-green-700"
                              aria-label="Save changes"
                            >
                              {processingAuthor === author.id ? (
                                <Loader size={18} className="animate-spin" />
                              ) : (
                                <Save size={18} />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-500 hover:text-gray-700"
                              aria-label="Cancel editing"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditAuthor(author.id)}
                              disabled={processingAuthor === author.id}
                              className="text-blue-500 hover:text-blue-700"
                              aria-label="Edit author"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAuthor(author.id)}
                              disabled={processingAuthor === author.id || author.bookCount > 0}
                              title={author.bookCount > 0 ? "Cannot delete authors with books" : "Delete author"}
                              aria-label={author.bookCount > 0 ? "Cannot delete authors with books" : "Delete author"}
                              className={`text-red-500 hover:text-red-700 ${
                                processingAuthor === author.id ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                author.bookCount > 0 ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                            >
                              {processingAuthor === author.id ? (
                                <Loader size={18} className="animate-spin" />
                              ) : (
                                <Trash size={18} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAuthors.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No authors found matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAuthors;
