import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, FileText, LogOut, Menu, X, ChevronRight, Users, Settings, Video, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/supabase';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-primary-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                className="md:hidden text-white focus:outline-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/admin" className="flex items-center space-x-2">
                <BookOpen size={28} className="text-accent-300" />
                <span className="text-xl font-bold font-display">Admin Portal</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-accent-300 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div 
              className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 space-y-4">
                <Link 
                  to="/admin" 
                  className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/admin/books" 
                  className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin/books') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <BookOpen size={20} />
                  <span>Books</span>
                </Link>
                <Link 
                  to="/admin/materials" 
                  className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin/materials') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <FileText size={20} />
                  <span>Materials</span>
                </Link>
                <Link 
                  to="/admin/multimedia" 
                  className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin/multimedia') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Video size={20} />
                  <span>Videos & Songs</span>
                </Link>
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 text-primary-600"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronRight size={20} />
                  <span>View Website</span>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-md">
          <div className="p-4 space-y-4">
            <Link 
              to="/admin" 
              className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin') && !isActive('/admin/books') && !isActive('/admin/materials') && !isActive('/admin/multimedia') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/admin/books" 
              className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin/books') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
            >
              <BookOpen size={20} />
              <span>Books</span>
            </Link>
            <Link 
              to="/admin/materials" 
              className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin/materials') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
            >
              <FileText size={20} />
              <span>Materials</span>
            </Link>
            <Link 
              to="/admin/multimedia" 
              className={`flex items-center space-x-2 p-3 rounded-lg ${isActive('/admin/multimedia') ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
            >
              <Video size={20} />
              <span>Videos & Songs</span>
            </Link>
            <div className="py-2 border-t border-gray-200">
              <Link 
                to="/" 
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 text-primary-600"
              >
                <ChevronRight size={20} />
                <span>View Website</span>
              </Link>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;