import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedBook from '../components/FeaturedBook';
import BookCard from '../components/BookCard';
import { BookOpen, Download, Palette, Brain, GraduationCap, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAllBooks } from '../services/bookService';

const HomePage: React.FC = () => {
  const [featuredBook, setFeaturedBook] = useState<any | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all books
      const booksData = await getAllBooks();
      
      if (booksData && booksData.length > 0) {
        setBooks(booksData);
        
        // Find the most recently added book to feature
        const sortedBooks = [...booksData].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setFeaturedBook(sortedBooks[0]);
      }
    } catch (err: any) {
      console.error('Error loading books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-primary-600">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl max-w-md w-full">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Error loading content</h3>
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
  
  // If no books were found
  if (!featuredBook || books.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Hero />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-primary-800 mb-4">No books found</h2>
          <p className="text-primary-600 mb-8">
            There are currently no books in the database. Please add some books from the admin panel.
          </p>
          <Link 
            to="/admin/books/new" 
            className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full"
          >
            Add Your First Book
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <Hero />
      
      {/* Featured Book */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center font-display text-primary-800">Latest Book</h2>
          <div className="w-24 h-1 bg-accent-400 mx-auto mt-4"></div>
        </div>
        <FeaturedBook book={featuredBook} />
      </section>
      
      {/* Book Collection */}
      <section className="bg-primary-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center font-display text-primary-800">Explore Our Collection</h2>
            <div className="w-24 h-1 bg-accent-400 mx-auto mt-4"></div>
            <p className="text-center text-primary-700 mt-4 max-w-2xl mx-auto">
              Discover T.L. Aurely's wonderful world of educational books filled with colorful characters and exciting learning adventures!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center font-display text-primary-800">Why Parents & Kids Love Our Books</h2>
          <div className="w-24 h-1 bg-accent-400 mx-auto mt-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-md text-center border-2 border-primary-100 hover:border-accent-300 transition-colors">
            <div className="bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Brain size={36} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Educational Fun</h3>
            <p className="text-primary-700">
              Our books blend entertainment with learning, helping children develop essential skills through engaging stories and lovable characters.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md text-center border-2 border-primary-100 hover:border-accent-300 transition-colors">
            <div className="bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Palette size={36} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Creative Activities</h3>
            <p className="text-primary-700">
              Extend the learning experience with our downloadable activities, coloring pages, and interactive materials that complement each book.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md text-center border-2 border-primary-100 hover:border-accent-300 transition-colors">
            <div className="bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={36} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Expert Guidance</h3>
            <p className="text-primary-700">
              Developed with educators and child development experts to ensure age-appropriate content that supports key learning milestones.
            </p>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="bg-gradient-to-r from-primary-100 to-secondary-100 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center font-display text-primary-800">What Parents & Teachers Say</h2>
            <div className="w-24 h-1 bg-accent-400 mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-accent-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-primary-700 italic mb-4">
                "My daughter absolutely loves the books! The educational content is perfectly balanced with fun storytelling. The downloadable activities keep her engaged for hours!"
              </p>
              <p className="font-bold text-primary-900">- Sarah M., Parent</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-accent-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-primary-700 italic mb-4">
                "As a kindergarten teacher, I use T.L. Aurely's books in my classroom regularly. The children are always excited about the stories, and the learning concepts are presented brilliantly."
              </p>
              <p className="font-bold text-primary-900">- Michael R., Teacher</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-accent-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-primary-700 italic mb-4">
                "These books helped my son learn so much in a fun way! The interactive downloads and audio materials made the experience even more special. Highly recommended!"
              </p>
              <p className="font-bold text-primary-900">- James K., Parent</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">Ready to Start a Learning Adventure?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explore T.L. Aurely's collection of fun educational books and free downloadable activities for children of all ages!
          </p>
          <Link 
            to="/books" 
            className="bg-accent-400 hover:bg-accent-300 text-primary-900 font-bold px-8 py-4 rounded-full transition-colors inline-block text-lg"
          >
            See All Books
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;