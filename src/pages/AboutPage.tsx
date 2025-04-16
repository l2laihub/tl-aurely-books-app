import React, { useState, useEffect } from 'react';
import { Mail, BookOpen, Award, MessageSquare, Palette, Heart, Star, Loader } from 'lucide-react';
import { getAuthorProfile } from '../services/authorService';
import type { AuthorProfileData } from '../services/authorService';

const AboutPage: React.FC = () => {
  const [authorProfile, setAuthorProfile] = useState<AuthorProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthorProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await getAuthorProfile();
        if (profileData) {
          setAuthorProfile(profileData);
          // Clear any previous error if we successfully got data
          setError(null);
        } else {
          // This should not happen with our improved error handling
          setError('No author profile found.');
        }
      } catch (err) {
        console.error('Error loading author profile:', err);
        setError('Failed to load author information.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthorProfile();
  }, []);
  return (
    <div className="bg-primary-50 min-h-screen">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16 relative overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute top-10 left-[15%]">
          <Star size={24} className="text-accent-300 animate-pulse" />
        </div>
        <div className="absolute top-20 right-[25%]">
          <Star size={18} className="text-accent-300 animate-pulse" />
        </div>
        <div className="absolute bottom-10 left-[30%]">
          <Star size={20} className="text-accent-300 animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            {isLoading ? 'Loading Author...' : `Meet ${authorProfile?.name || 'T.L. Aurely'}`}
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            The creative mind behind our wonderful world of educational children's books.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center mb-12">
            <Loader size={40} className="animate-spin mx-auto text-primary-600 mb-4" />
            <p className="text-primary-600">Loading author information...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center mb-12 text-red-600">
            <p>{error}</p>
            <p>Using default author information.</p>
          </div>
        ) : (
          /* Author Profile */
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12 border-4 border-primary-200">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-br from-primary-100 to-primary-200 flex justify-center items-center p-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-accent-300 rounded-lg transform rotate-3"></div>
                  <img 
                    src={authorProfile?.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"} 
                    alt={authorProfile?.name || "T.L. Aurely"}
                    className="relative rounded-lg shadow-xl h-72 w-60 object-cover z-10 border-4 border-white"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-full shadow-lg z-20">
                    <Palette size={32} className="text-primary-600" />
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <h2 className="text-3xl font-bold mb-2 font-display text-primary-800">{authorProfile?.name || "T.L. Aurely"}</h2>
                <p className="text-secondary-600 italic mb-6">{authorProfile?.title || "Award-winning children's book author & educator"}</p>
                
                <div className="space-y-6">
                  {authorProfile && authorProfile.bio.length > 0 ? (
                    authorProfile.bio.map((paragraph, index) => (
                      <p key={`bio-${index}`} className="text-primary-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="text-primary-700 leading-relaxed">
                        T.L. Aurely is a passionate educator and storyteller dedicated to creating books that make learning fun and engaging for young readers. With a background in early childhood education and a love for colorful illustrations, T.L. brings educational concepts to life through captivating stories and lovable characters.
                      </p>
                      <p className="text-primary-700 leading-relaxed">
                        After teaching kindergarten for over 10 years, T.L. recognized the need for children's books that blend entertainment with valuable learning experiences. This inspired the creation of a series of children's books that help develop essential skills while sparking imagination and curiosity.
                      </p>
                      <p className="text-primary-700 leading-relaxed">
                        When not writing or illustrating, T.L. can be found conducting interactive story time sessions at libraries and schools, designing new educational activities, and playing with a rescue dog named Scribbles who often serves as inspiration for book characters.
                      </p>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <a href="/contact" className="inline-flex items-center bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-full transition-colors">
                    <Mail size={18} className="mr-2" />
                    Contact T.L.
                  </a>
                  <a href="/contact" className="inline-flex items-center bg-white hover:bg-gray-100 text-primary-700 border-2 border-primary-600 font-medium py-2 px-4 rounded-full transition-colors">
                    <MessageSquare size={18} className="mr-2" />
                    School Visits
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      
        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-primary-100">
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <BookOpen size={24} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display text-primary-800">20+ Educational Books</h3>
            <p className="text-primary-700">
              Creating stories that teach essential skills across areas including literacy, STEM, social-emotional learning, and creative thinking.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-primary-100">
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Award size={24} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Award-Winning</h3>
            <p className="text-primary-700">
              Recipient of multiple children's literature awards including the Children's Literacy Award and the Early Education Excellence Medal.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-primary-100">
            <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Heart size={24} className="text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display text-primary-800">Loved by Kids & Parents</h3>
            <p className="text-primary-700">
              Books trusted by thousands of families and educators worldwide to inspire a love of reading and learning in young children.
            </p>
          </div>
        </div>
        
        {/* Author Statement */}
        <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-3xl p-8 mb-12 relative">
          <div className="absolute top-4 left-4 text-accent-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          <blockquote className="text-xl italic text-primary-800 leading-relaxed ml-12 mr-6 mt-2">
            {authorProfile?.quote || "I believe that every child has a unique spark of curiosity and creativity. My goal as an author is to nurture that spark through stories that entertain while they educate. The downloadable activities I create are designed to extend the learning beyond the book and create moments of connection between children and their caregivers. When I receive letters from parents about how my books have made learning fun for their children, I'm reminded of why I do what I do."}
          </blockquote>
          <div className="mt-4 text-right mr-6">
            <p className="font-semibold text-primary-800">— T.L. Aurely</p>
          </div>
        </div>
        
        {/* Creative Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 font-display text-primary-800 text-center">The Creative Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {authorProfile && authorProfile.creative_process.length > 0 ? (
                authorProfile.creative_process.map((paragraph, index) => (
                  <p key={`process-${index}`} className={`text-primary-700 ${index < authorProfile.creative_process.length - 1 ? 'mb-4' : ''}`}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-primary-700 mb-4">
                    T.L. Aurely's creative process begins with identifying key learning concepts that children find challenging or particularly exciting. Research with educators and child development experts helps shape these concepts into age-appropriate stories.
                  </p>
                  <p className="text-primary-700 mb-4">
                    Characters are designed to be relatable and diverse, ensuring all children can see themselves in the stories. Each character has distinctive traits that help reinforce the educational concepts being explored.
                  </p>
                  <p className="text-primary-700">
                    T.L. tests each story with groups of children before finalizing the manuscripts, observing their engagement and comprehension. The downloadable materials are developed alongside the story to reinforce learning objectives and provide extended activities for the home or classroom.
                  </p>
                </>
              )}
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Children reading together"
                className="rounded-2xl shadow-md h-auto max-w-full border-4 border-accent-300"
              />
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 font-display">Join our Parent & Teacher Community</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for educational tips, new book announcements, and exclusive free activities from T.L. Aurely.
          </p>
          <form className="max-w-md mx-auto flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-300 text-gray-900"
            />
            <button 
              type="submit" 
              className="bg-accent-400 hover:bg-accent-300 text-primary-900 font-medium px-6 py-3 rounded-full transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;