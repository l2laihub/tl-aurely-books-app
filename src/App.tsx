
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetails from './pages/BookDetails';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MultimediaPage from './pages/MultimediaPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminMaterials from './pages/admin/AdminMaterials';
import AdminMultimedia from './pages/admin/AdminMultimedia';
import AdminBookForm from './pages/admin/AdminBookForm';
import AdminAuthors from './pages/admin/AdminAuthors';
import AdminAuthorProfile from './pages/admin/AdminAuthorProfile';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="book/:id" element={<BookDetails />} />
            <Route path="multimedia/:id" element={<MultimediaPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="books/new" element={<AdminBookForm />} />
            <Route path="books/edit/:id" element={<AdminBookForm />} />
            <Route path="authors" element={<AdminAuthors />} />
            <Route path="authors/profile" element={<AdminAuthorProfile />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="multimedia" element={<AdminMultimedia />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;