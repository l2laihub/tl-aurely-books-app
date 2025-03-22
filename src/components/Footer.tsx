import React from 'react';
import { Mail, Instagram, Twitter, Facebook, Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white relative">
      {/* Decorative wave at the top */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path fill="#365e47" d="M0,64L80,64C160,64,320,64,480,74.7C640,85,800,107,960,101.3C1120,96,1280,64,1360,48L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 animate-float" style={{ animationDelay: "0.5s" }}>
        <Star size={24} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.3s" }} />
      </div>
      <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: "1.3s" }}>
        <Star size={18} className="text-cream-300 animate-twinkle" style={{ animationDelay: "0.7s" }} />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 font-display flex items-center">
              <span>T.L. Aurely</span>
              <Star size={14} className="text-cream-300 mx-1 animate-twinkle" />
              <span>Books</span>
            </h3>
            <p className="mb-4 font-body">
              Bringing magical educational adventures to young minds through 
              delightful stories and interactive learning materials.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-cream-300 transition-colors bg-primary-700 p-2 rounded-full">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-cream-300 transition-colors bg-primary-700 p-2 rounded-full">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-cream-300 transition-colors bg-primary-700 p-2 rounded-full">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-cream-300 transition-colors bg-primary-700 p-2 rounded-full">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 font-display">Quick Links</h3>
            <ul className="space-y-2 font-body">
              <li><a href="/" className="hover:text-cream-300 transition-colors flex items-center"><Star size={12} className="mr-2 text-accent-400" />Home</a></li>
              <li><a href="/books" className="hover:text-cream-300 transition-colors flex items-center"><Star size={12} className="mr-2 text-accent-400" />All Books</a></li>
              <li><a href="/about" className="hover:text-cream-300 transition-colors flex items-center"><Star size={12} className="mr-2 text-accent-400" />About T.L. Aurely</a></li>
              <li><a href="/contact" className="hover:text-cream-300 transition-colors flex items-center"><Star size={12} className="mr-2 text-accent-400" />Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 font-display">Parent Newsletter</h3>
            <p className="mb-4 font-body">Subscribe to receive educational tips, new book announcements, and free activities for kids.</p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-2 bg-primary-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-cream-300 focus:ring-opacity-50"
              />
              <button 
                type="submit" 
                className="bg-accent-500 hover:bg-accent-400 text-white font-medium px-4 py-2 rounded-full transition-colors"
              >
                Join the Fun!
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-primary-700 mt-8 pt-8 text-center font-body">
          <p>&copy; {new Date().getFullYear()} T.L. Aurely's Wonder Books. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;