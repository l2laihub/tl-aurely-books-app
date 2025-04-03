import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { updateUserPassword } from '../../lib/supabase';
import { BookOpen, Lock, ArrowLeft } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasNumber: false,
    hasUppercase: false,
  });
  const navigate = useNavigate();

  // Check if the user has a valid recovery token in the URL
  useEffect(() => {
    const checkRecoveryToken = async () => {
      const hash = window.location.hash;
      
      // If there's no hash, the user might have navigated directly without a recovery token
      if (!hash || !hash.includes('type=recovery')) {
        setMessage({
          type: 'error',
          text: 'Invalid or expired recovery link. Please request a new password reset.'
        });
      }
    };

    checkRecoveryToken();
  }, []);

  // Validate password as the user types
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.'
      });
      return;
    }

    if (!passwordValidation.length || !passwordValidation.hasNumber || !passwordValidation.hasUppercase) {
      setMessage({
        type: 'error',
        text: 'Password does not meet requirements.'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserPassword(password);
      
      if (error) {
        throw error;
      }
      
      setMessage({
        type: 'success',
        text: 'Password reset successful! Redirecting to login...'
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <BookOpen size={40} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-center font-display text-primary-800">
            Create New Password
          </h1>
          <p className="text-primary-600 mt-2">Enter your new password</p>
        </div>

        {message && (
          <div 
            className={`${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            } px-4 py-3 rounded-lg mb-6 border`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>
            
            {/* Password requirements */}
            <div className="mt-2 space-y-1 text-sm">
              <p className={passwordValidation.length ? 'text-green-600' : 'text-gray-500'}>
                ✓ At least 8 characters
              </p>
              <p className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                ✓ At least one number
              </p>
              <p className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                ✓ At least one uppercase letter
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`pl-10 w-full px-4 py-3 border ${
                  confirmPassword && password !== confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                } rounded-lg`}
                placeholder="••••••••"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-4 rounded-lg transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link to="/admin/login" className="flex items-center justify-center text-primary-600 hover:text-primary-800 font-medium transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
