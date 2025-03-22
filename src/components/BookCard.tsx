import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../data/books';
import { Video, Music, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 border-4 border-primary-200 hover:border-accent-300 hover:shadow-xl relative group">
      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 w-12 h-12 bg-cream-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-secondary-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative overflow-hidden">
        <img 
          src={book.coverImage} 
          alt={`${book.title} cover`}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-accent-400 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
          {book.ageRange}
        </div>
        
        {/* Decorative star */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star size={24} className="text-cream-400 drop-shadow-md" />
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-primary-800 font-display line-clamp-2">{book.title}</h3>
        </div>
        <p className="text-primary-700 mb-2 font-medium font-body">by {book.author}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {book.genre.slice(0, 3).map((genre, index) => (
            <span 
              key={index}
              className="text-xs px-3 py-1 bg-secondary-100 text-secondary-700 font-medium rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
        <p className="text-charcoal-600 mb-4 line-clamp-3 font-body">{book.description}</p>
        <div className="flex flex-wrap gap-2">
          <Link 
            to={`/book/${book.id}`}
            className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1"
          >
            Explore Book
          </Link>
          <Link 
            to={`/multimedia/${book.id}`}
            className="inline-flex items-center bg-secondary-600 hover:bg-secondary-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1"
          >
            <Video size={18} className="mr-2" />
            Videos & Songs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;