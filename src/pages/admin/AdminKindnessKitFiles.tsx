import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getKindnessKitById, 
  getKitFiles, 
  uploadKitFile, 
  addKitFile, 
  deleteKitFile,
  KindnessKit,
  KitFile
} from '../../services/kindnessKitService';
import { ArrowLeft, Upload, Trash2, AlertTriangle, CheckCircle, XCircle, FileText, Music, Image } from 'lucide-react';

const AdminKindnessKitFiles: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Data state
  const [kit, setKit] = useState<KindnessKit | null>(null);
  const [files, setFiles] = useState<KitFile[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  
  // Form state
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');
  
  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/admin/kindness-kits');
        return;
      }
      
      try {
        setLoading(true);
        
        // Load kindness kit data
        const kitData = await getKindnessKitById(id);
        if (!kitData) {
          setError('Kindness kit not found');
          setLoading(false);
          return;
        }
        
        setKit(kitData);
        
        // Load kit files
        const filesData = await getKitFiles(id);
        setFiles(filesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFile(file);
      
      // Set default file name from the file name
      if (!newFileName) {
        const fileName = file.name.split('.')[0]; // Remove extension
        setNewFileName(fileName);
      }
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!id || !newFile || !newFileName) {
      setError('Please select a file and provide a name');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // Upload file to storage
      const fileUrl = await uploadKitFile(newFile, id, newFileType);
      
      // Add file to database
      const fileData = {
        kit_id: id,
        file_name: newFileName,
        file_type: newFileType,
        file_url: fileUrl,
        sort_order: files.length + 1
      };
      
      const fileId = await addKitFile(fileData);
      
      // Update local state
      setFiles([...files, { ...fileData, id: fileId, created_at: new Date().toISOString() }]);
      
      // Reset form
      setNewFile(null);
      setNewFileName('');
      
      // Show success notification
      setNotification({
        message: 'File uploaded successfully',
        type: 'success'
      });
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle file deletion
  const handleDeleteClick = (fileId: string) => {
    setDeleteConfirmation(fileId);
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteKitFile(deleteConfirmation);
      
      // Update local state
      setFiles(files.filter(file => file.id !== deleteConfirmation));
      
      // Show success notification
      setNotification({
        message: 'File deleted successfully',
        type: 'success'
      });
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    } finally {
      setDeleteConfirmation(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };
  
  // Get icon for file type
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText size={20} />;
      case 'audio':
        return <Music size={20} />;
      case 'image':
        return <Image size={20} />;
      default:
        return <FileText size={20} />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} className="mr-2" />
          ) : (
            <XCircle size={20} className="mr-2" />
          )}
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/kindness-kits')}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Kindness Kits
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Manage Files for {kit?.title}
        </h1>
        <p className="text-gray-600 mb-6">
          Upload and manage files that will be available for download in the kindness kit.
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Upload Form */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New File</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="file-name" className="block text-sm font-medium text-gray-700 mb-1">
                File Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="file-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Coloring Pages"
                required
              />
            </div>
            
            <div>
              <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-1">
                File Type <span className="text-red-500">*</span>
              </label>
              <select
                id="file-type"
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="pdf">PDF Document</option>
                <option value="audio">Audio File</option>
                <option value="image">Image</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span>Choose file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {newFile ? newFile.name : 'No file chosen'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!newFile || !newFileName || uploading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
            >
              <Upload size={18} className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>
        
        {/* Files List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Kit Files</h2>
          
          {files.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Upload size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No files yet</h3>
              <p className="text-gray-500">
                Upload files using the form above to add them to this kindness kit.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileTypeIcon(file.file_type)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{file.file_name}</div>
                            <a 
                              href={file.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-800"
                            >
                              View file
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {file.file_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.created_at || '').toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(file.id)}
                          className="text-red-600 hover:text-red-900 flex items-center ml-auto"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this file? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKindnessKitFiles;