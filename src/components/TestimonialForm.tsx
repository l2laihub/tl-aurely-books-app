import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Testimonial, TestimonialFormData } from '../types/Testimonial';
import StarRating from './StarRating';

interface TestimonialFormProps {
  testimonial?: Testimonial;
  bookId?: string;
  books?: { id: string; title: string }[];
  onSubmit: (formData: TestimonialFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form component for adding/editing testimonials
 * 
 * @param testimonial - Existing testimonial for editing (optional)
 * @param bookId - Pre-selected book ID (optional)
 * @param books - List of books for selection
 * @param onSubmit - Callback when form is submitted
 * @param onCancel - Callback when form is cancelled
 * @param isSubmitting - Whether the form is currently submitting
 */
const TestimonialForm: React.FC<TestimonialFormProps> = ({
  testimonial,
  bookId,
  books = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Initialize form data
  const [formData, setFormData] = useState<TestimonialFormData>({
    book_id: bookId || testimonial?.book_id || '',
    reviewer_name: testimonial?.reviewer_name || '',
    rating: testimonial?.rating || 5,
    title: testimonial?.title || '',
    content: testimonial?.content || '',
    date: testimonial?.date || new Date().toISOString().split('T')[0],
    source: testimonial?.source || '',
    verified_purchase: testimonial?.verified_purchase || false,
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when testimonial or bookId changes
  useEffect(() => {
    if (testimonial) {
      setFormData({
        book_id: testimonial.book_id,
        reviewer_name: testimonial.reviewer_name,
        rating: testimonial.rating,
        title: testimonial.title,
        content: testimonial.content,
        date: testimonial.date,
        source: testimonial.source || '',
        verified_purchase: testimonial.verified_purchase || false,
      });
    } else if (bookId) {
      setFormData(prev => ({ ...prev, book_id: bookId }));
    }
  }, [testimonial, bookId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when it's changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle star rating change
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.book_id) {
      newErrors.book_id = 'Please select a book';
    }
    
    if (!formData.reviewer_name.trim()) {
      newErrors.reviewer_name = 'Reviewer name is required';
    }
    
    if (formData.title && !formData.title.trim()) {
      newErrors.title = 'If provided, review title cannot be empty';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Review content is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting testimonial:', error);
        // You could set a general form error here if needed
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Book Selection (only show if bookId is not provided) */}
        {!bookId && (
          <div className="mb-4">
            <label htmlFor="book_id" className="block text-sm font-medium text-gray-700 mb-1">
              Book*
            </label>
            <select
              id="book_id"
              name="book_id"
              value={formData.book_id}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.book_id ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting || !!bookId}
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
            {errors.book_id && (
              <p className="mt-1 text-sm text-red-600">{errors.book_id}</p>
            )}
          </div>
        )}

        {/* Reviewer Name */}
        <div className="mb-4">
          <label htmlFor="reviewer_name" className="block text-sm font-medium text-gray-700 mb-1">
            Reviewer Name*
          </label>
          <input
            type="text"
            id="reviewer_name"
            name="reviewer_name"
            value={formData.reviewer_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.reviewer_name ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          />
          {errors.reviewer_name && (
            <p className="mt-1 text-sm text-red-600">{errors.reviewer_name}</p>
          )}
        </div>

        {/* Review Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            placeholder="A brief title for this review"
            className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating*
          </label>
          <StarRating
            rating={formData.rating}
            readOnly={false}
            onChange={handleRatingChange}
            size={24}
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date*
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Source */}
        <div className="mb-4">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source || ''}
            onChange={handleChange}
            placeholder="e.g., Amazon, Goodreads"
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          />
        </div>

        {/* Verified Purchase */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verified_purchase"
              name="verified_purchase"
              checked={formData.verified_purchase || false}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="verified_purchase" className="ml-2 block text-sm text-gray-700">
              Verified Purchase
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content*
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className={`w-full p-2 border rounded-md ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : testimonial ? 'Update Testimonial' : 'Add Testimonial'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestimonialForm;
