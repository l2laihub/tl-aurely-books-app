import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllKindnessKits, KindnessKit, deleteKindnessKit } from '../../services/kindnessKitService';
import { getAllBooks } from '../../services/bookService';
import { Book } from '../../types/Book';
import { Plus, Edit, Trash2, FileText, Gift, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AdminKindnessKits: React.FC = () => {
  const [kindnessKits, setKindnessKits] = useState<KindnessKit[]>([]);
  const [books, setBooks] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all kindness kits
        const kits = await getAllKindnessKits();
        setKindnessKits(kits);
        
        // Fetch all books and create a lookup map
        const booksData = await getAllBooks();
        const booksMap: Record<string, Book> = {};
        booksData.forEach(book => {
          booksMap[book.id] = book;
        });
        setBooks(booksMap);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load kindness kits. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDeleteClick = (kitId: string) => {
    setDeleteConfirmation(kitId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteKindnessKit(deleteConfirmation);
      setKindnessKits(kindnessKits.filter(kit => kit.id !== deleteConfirmation));
      setNotification({ message: 'Kindness kit deleted successfully', type: 'success' });
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting kindness kit:', err);
      setNotification({ message: 'Failed to delete kindness kit', type: 'error' });
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} className="mr-2" />
          ) : (
            <XCircle size={20} className="mr-2" />
          )}
          <p>{notification.message}</p>
        </div>
      )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kindness Kits</h1>
          <Link
            to="/admin/kindness-kits/new"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Create New Kit
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : kindnessKits.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Gift size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Kindness Kits Found</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any kindness kits yet. Create your first kit to get started.
            </p>
            <Link
              to="/admin/kindness-kits/new"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Create First Kit
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {kindnessKits.map(kit => (
              <div key={kit.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{kit.title}</h2>
                    <p className="text-gray-600 mb-2">
                      Book: {books[kit.book_id]?.title || 'Unknown Book'}
                    </p>
                    <div className="flex items-center mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        kit.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {kit.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    <Link
                      to={`/admin/kindness-kits/${kit.id}/files`}
                      className="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-3 py-2 rounded flex items-center"
                    >
                      <FileText size={16} className="mr-2" />
                      Manage Files
                    </Link>
                    <Link
                      to={`/admin/kindness-kits/${kit.id}/edit`}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded flex items-center"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(kit.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded flex items-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this kindness kit? This action cannot be undone.
                All associated files and subscriber data will also be deleted.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminKindnessKits;