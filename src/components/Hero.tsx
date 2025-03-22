import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Star } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-[10%] animate-float">
        <Star size={40} className="text-cream-300 animate-twinkle" />
      </div>
      <div className="absolute bottom-20 left-[20%] animate-float" style={{ animationDelay: '0.5s' }}>
        <Star size={30} className="text-cream-300 animate-twinkle" style={{ animationDelay: '0.3s' }} />
      </div>
      <div className="absolute top-1/3 right-[15%] animate-float" style={{ animationDelay: '1s' }}>
        <Star size={50} className="text-cream-300 animate-twinkle" style={{ animationDelay: '0.7s' }} />
      </div>
      <div className="absolute bottom-10 right-[30%] animate-float" style={{ animationDelay: '1.5s' }}>
        <Sparkles size={36} className="text-cream-300 animate-twinkle" style={{ animationDelay: '1.2s' }} />
      </div>
      
      {/* Whimsical bubble cloud shapes */}
      <div className="absolute top-20 left-10 w-32 h-24 bg-white opacity-10 rounded-bubble animate-float" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute bottom-40 right-20 w-40 h-28 bg-white opacity-10 rounded-bubble animate-float" style={{ animationDelay: '1.3s' }}></div>
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')] bg-cover opacity-10"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <BookOpen size={20} className="mr-2 text-cream-300" />
            <span className="font-medium">Educational Adventures Await!</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-display">Magical Stories for Curious Young Minds</h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 font-body">
            Join T.L. Aurely's colorful world of educational children's books filled with fun characters, exciting adventures, and valuable lessons.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/books"
              className="bg-accent-500 hover:bg-accent-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 text-lg transform hover:-translate-y-1 hover:shadow-lg"
            >
              Explore Books
            </Link>
            <Link
              to="/about"
              className="bg-white/20 hover:bg-white/30 border-2 border-white px-8 py-4 rounded-full transition-all duration-300 text-lg transform hover:-translate-y-1 hover:shadow-lg"
            >
              Meet the Author
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;