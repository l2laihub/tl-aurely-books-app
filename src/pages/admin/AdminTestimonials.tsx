import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, AlertCircle, Loader, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllTestimonials, deleteTestimonial } from '../../services/testimonialService';
import { getAllBooks } from '../../services/bookService';
import TestimonialCard from '../../components/TestimonialCard';
import TestimonialForm from '../../components/TestimonialForm';
import { Testimonial, TestimonialFormData } from '../../types/Testimonial';

/**
 * Admin page for managing testimonials
 */
const AdminTestimonials: React.FC = () => {
  // State for testimonials and pagination
  const [testimonials, setTestimonials] = useState<(Testimonial & { book_title?: string })[]>([]);
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');

  // State for form management
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Navigation and authentication
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Load testimonials with pagination and filtering
  const loadTestimonials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get testimonials from service
      const result = await getAllTestimonials(currentPage, pageSize);
      
      // Filter by book if selected
      let filteredTestimonials = result.testimonials;
      if (selectedBookId) {
        filteredTestimonials = filteredTestimonials.filter(t => t.book_id === selectedBookId);
      }
      
      setTestimonials(filteredTestimonials);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('Error loading testimonials:', err);
      setError('Failed to load testimonials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedBookId]);

  // Load books for the filter dropdown
  const loadBooks = useCallback(async () => {
    try {
      const booksData = await getAllBooks();
      setBooks(booksData.map(book => ({ id: book.id, title: book.title })));
    } catch (err) {
      console.error('Error loading books:', err);
      // Don't set error state here to avoid disrupting the main testimonial loading
    }
  }, []);

  // Add useEffect hooks for loading data
  useEffect(() => {
    if (isAuthenticated) {
      loadTestimonials();
      loadBooks();
    }
  }, [isAuthenticated, loadTestimonials, loadBooks]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle testimonial deletion
  const handleDeleteTestimonial = async (id: string) => {
    try {
      setIsDeleting(id);
      await deleteTestimonial(id);
      
      // Update local state to remove the deleted testimonial
      setTestimonials(prev => prev.filter(t => t.id !== id));
      
      // Reload if this was the last item on the page
      if (testimonials.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        loadTestimonials();
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete testimonial. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle testimonial edit
  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  // Handle form submission (create/update)
  const handleSubmitTestimonial = async (formData: TestimonialFormData) => {
    try {
      setIsSubmitting(true);
      
      if (editingTestimonial) {
        // Update existing testimonial
        await import('../../services/testimonialService').then(module => {
          return module.updateTestimonial(editingTestimonial.id, formData);
        });
      } else {
        // Create new testimonial
        await import('../../services/testimonialService').then(module => {
          return module.createTestimonial(formData);
        });
      }
      
      // Reset form state and reload testimonials
      setShowForm(false);
      setEditingTestimonial(null);
      loadTestimonials();
    } catch (err) {
      console.error('Error saving testimonial:', err);
      alert('Failed to save testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter testimonials by search term
  const filteredTestimonials = testimonials.filter(testimonial => 
    testimonial.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (testimonial.book_title && testimonial.book_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        &laquo;
      </button>
    );
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            i === currentPage
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        &raquo;
      </button>
    );
    
    return (
      <div className="flex justify-center space-x-1 mt-6">
        {pages}
      </div>
    );
  };

  // If not authenticated, return null (redirect handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">
          Manage Testimonials
        </h1>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setShowForm(true);
          }}
          className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Testimonial
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Book filter */}
          <div className="md:w-1/3">
            <label htmlFor="book-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Book
            </label>
            <select
              id="book-filter"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Books</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="md:w-2/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Testimonials
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by reviewer name or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error loading testimonials</h3>
            <p>{error}</p>
            <button 
              onClick={loadTestimonials}
              className="mt-2 text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Testimonial form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <TestimonialForm
              testimonial={editingTestimonial || undefined}
              books={books}
              onSubmit={handleSubmitTestimonial}
              onCancel={() => {
                setShowForm(false);
                setEditingTestimonial(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading testimonials...</p>
        </div>
      ) : (
        <>
          {/* Testimonials list */}
          <div className="space-y-4">
            {filteredTestimonials.length > 0 ? (
              filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4">
                    {/* Book info */}
                    <div className="flex items-center mb-3 text-sm text-gray-500">
                      <BookOpen size={16} className="mr-1" />
                      <span>{testimonial.book_title || 'Unknown Book'}</span>
                    </div>
                    
                    {/* Testimonial card */}
                    <TestimonialCard
                      testimonial={testimonial}
                      showActions={true}
                      isDeleting={isDeleting === testimonial.id}
                      onEdit={() => handleEditTestimonial(testimonial)}
                      onDelete={handleDeleteTestimonial}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">No testimonials found matching your criteria.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && renderPagination()}
          
          {/* Results count */}
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {filteredTestimonials.length} of {totalCount} testimonials
          </div>
        </>
      )}
    </div>
  );
};

export default AdminTestimonials;
