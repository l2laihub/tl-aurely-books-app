import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, UserCog, Star } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md relative">
      {/* Decorative elements */}
      <div className="absolute bottom-0 w-full overflow-hidden h-2 opacity-60">
        <div className="w-full h-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent-300 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/images/tl-aurely-logo.png"
              alt="T.L. Aurely Logo"
              className="h-12 w-auto"
            />
            <div className="flex items-center">
              <span className="text-lg font-medium font-display">T.L. Aurely Books</span>
            </div>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-cream-300 transition-colors text-lg font-medium">
              Home
            </Link>
            <Link to="/books" className="hover:text-cream-300 transition-colors text-lg font-medium">
              All Books
            </Link>
            <Link to="/about" className="hover:text-cream-300 transition-colors text-lg font-medium">
              About T.L. Aurely
            </Link>
            <Link to="/contact" className="hover:text-cream-300 transition-colors text-lg font-medium">
              Contact
            </Link>
            <Link to="/admin" className="inline-flex items-center text-cream-300 hover:text-cream-200 transition-colors text-lg font-medium">
              <UserCog size={20} className="mr-1" />
              Admin
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="hover:text-cream-300 transition-colors text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/books" 
              className="hover:text-cream-300 transition-colors text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              All Books
            </Link>
            <Link 
              to="/about" 
              className="hover:text-cream-300 transition-colors text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About T.L. Aurely
            </Link>
            <Link 
              to="/contact" 
              className="hover:text-cream-300 transition-colors text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/admin" 
              className="inline-flex items-center text-cream-300 hover:text-cream-200 transition-colors text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserCog size={20} className="mr-1" />
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;