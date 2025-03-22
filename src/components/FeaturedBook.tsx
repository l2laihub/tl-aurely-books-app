import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../data/books';
import { Star, ChevronRight } from 'lucide-react';

interface FeaturedBookProps {
  book: Book;
}

const FeaturedBook: React.FC<FeaturedBookProps> = ({ book }) => {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-3xl overflow-hidden shadow-xl border-4 border-cream-300">
      <div className="absolute inset-0 opacity-10">
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-6 left-6 animate-float" style={{ animationDelay: "0.3s" }}>
        <Star size={32} className="text-cream-300 animate-twinkle" />
      </div>
      <div className="absolute bottom-6 right-6 animate-float" style={{ animationDelay: "0.7s" }}>
        <Star size={24} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.2s" }} />
      </div>
      <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: "1.1s" }}>
        <Star size={18} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.8s" }} />
      </div>
      
      <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 md:p-12">
        <div className="flex flex-col justify-center">
          <div className="mb-4 inline-flex bg-accent-500 text-white px-4 py-1 rounded-full font-medium shadow-md">
            Featured Book
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">{book.title}</h2>
          <p className="text-xl mb-2 font-body">by {book.author}</p>
          <div className="bg-white/20 px-3 py-1 rounded-full inline-block mb-4 backdrop-blur-sm font-body">
            For ages {book.ageRange}
          </div>
          <div className="flex flex-wrap gap-2 my-4">
            {book.genre.map((genre, index) => (
              <span 
                key={index}
                className="text-sm px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm font-body"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="mb-6 text-white/90 line-clamp-4 font-body">{book.description}</p>
          <Link 
            to={`/book/${book.id}`}
            className="inline-flex items-center bg-accent-500 text-white hover:bg-accent-400 font-medium py-3 px-6 rounded-full transition-all duration-300 self-start transform hover:-translate-y-1 hover:shadow-lg"
          >
            Explore Book <ChevronRight size={20} className="ml-1" />
          </Link>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-300 to-accent-300 rounded-2xl transform rotate-3"></div>
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="relative h-[400px] w-auto object-cover rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBook;