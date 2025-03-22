import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Download, Users, TrendingUp, Clock, Plus, ExternalLink, Loader, AlertCircle, BookMarked, Star } from 'lucide-react';
import { getAllBooks } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMaterials: 0,
    totalGenres: 0,
    recentVisits: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load books with all related data
      const booksData = await getAllBooks();
      setBooks(booksData);

      // Calculate stats
      let totalMaterials = 0;
      const allGenres = new Set<string>();
      
      booksData.forEach((book: any) => {
        totalMaterials += book.downloadMaterials?.length || 0;
        book.genre.forEach((genre: string) => allGenres.add(genre));
      });

      // Set stats
      setStats({
        totalBooks: booksData.length,
        totalMaterials: totalMaterials,
        totalGenres: allGenres.size,
        recentVisits: Math.floor(Math.random() * 100) + 50 // Mock data for visits
      });

      // Generate recent activities based on real data
      const activities = [];
      
      // Get the 5 most recent books
      const recentBooks = [...booksData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      
      // Create activities from recent books
      for (const book of recentBooks) {
        const createdAt = new Date(book.created_at);
        const timeAgo = getTimeAgo(createdAt);
        
        activities.push({
          type: 'book_added',
          message: `Book "${book.title}" was added`,
          timeAgo: timeAgo,
          timestamp: createdAt.getTime()
        });
        
        // Add material activities for the most recent book
        if (book.downloadMaterials && book.downloadMaterials.length > 0) {
          // Use the first material as a recent activity
          const material = book.downloadMaterials[0];
          const materialDate = new Date(createdAt.getTime() - 3600000); // 1 hour before book
          activities.push({
            type: 'material_added',
            message: `Material "${material.title}" was added to "${book.title}"`,
            timeAgo: getTimeAgo(materialDate),
            timestamp: materialDate.getTime()
          });
        }
      }
      
      // Sort activities by timestamp and take the 5 most recent
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 5));

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    }
    if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    }
    return 'just now';
  };

  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-4 md:mb-0">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/books/new"
            className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add New Book
          </Link>
          <Link
            to="/"
            className="bg-white hover:bg-gray-100 text-primary-700 border border-gray-300 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
            target="_blank"
          >
            <ExternalLink size={18} className="mr-2" />
            View Website
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error loading dashboard</h3>
            <p>{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-2 text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size={40} className="animate-spin text-primary-600 mb-4" />
          <p className="text-primary-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-600">
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-full p-3 mr-4">
                  <BookOpen className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Books</p>
                  <h3 className="text-2xl font-bold text-primary-800">{stats.totalBooks}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-accent-400">
              <div className="flex items-center">
                <div className="bg-accent-100 rounded-full p-3 mr-4">
                  <Download className="text-accent-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Materials</p>
                  <h3 className="text-2xl font-bold text-primary-800">{stats.totalMaterials}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-secondary-600">
              <div className="flex items-center">
                <div className="bg-secondary-100 rounded-full p-3 mr-4">
                  <Star className="text-secondary-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Unique Genres</p>
                  <h3 className="text-2xl font-bold text-primary-800">{stats.totalGenres}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Estimated Site Visits</p>
                  <h3 className="text-2xl font-bold text-primary-800">{stats.recentVisits}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities & Books */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary-800 font-display">Recent Activities</h2>
              
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start border-b border-gray-100 pb-4">
                      <div className={`rounded-full p-2 mr-3 ${
                        activity.type === 'book_added' ? 'bg-primary-100' : 
                        activity.type === 'material_added' ? 'bg-accent-100' : 'bg-gray-100'
                      }`}>
                        {activity.type === 'book_added' ? (
                          <BookOpen className="text-primary-600" size={18} />
                        ) : activity.type === 'material_added' ? (
                          <Download className="text-accent-600" size={18} />
                        ) : (
                          <Clock className="text-gray-600" size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-primary-800 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No recent activities</p>
              )}
              
              {books.length > 5 && (
                <div className="mt-4 text-center">
                  <Link to="/admin/books" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View All Books
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary-800 font-display">Recent Books</h2>
              
              {books.length > 0 ? (
                <div className="space-y-4">
                  {books.slice(0, 5).map((book) => (
                    <div key={book.id} className="flex items-center border-b border-gray-100 pb-4">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded mr-4 border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="text-primary-800 font-medium line-clamp-1">{book.title}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-3">{book.downloadMaterials?.length || 0} materials</span>
                          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                            {book.ageRange}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/admin/books/edit/${book.id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No books added yet</p>
              )}
              
              <div className="mt-4 text-center">
                <Link 
                  to="/admin/books" 
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Manage All Books
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;