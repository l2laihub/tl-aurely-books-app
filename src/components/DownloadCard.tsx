import React from 'react';
import { FileText, Music, Video, Image, File, Download } from 'lucide-react';

interface DownloadMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize: string;
}

interface DownloadCardProps {
  material: DownloadMaterial;
}

const DownloadCard: React.FC<DownloadCardProps> = ({ material }) => {
  const getIcon = () => {
    switch (material.type) {
      case 'pdf':
        return <FileText className="text-accent-500" size={28} />;
      case 'audio':
        return <Music className="text-secondary-500" size={28} />;
      case 'video':
        return <Video className="text-primary-500" size={28} />;
      case 'image':
        return <Image className="text-cream-500" size={28} />;
      default:
        return <File className="text-charcoal-500" size={28} />;
    }
  };

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    try {
      // For base64 data (usually images, sometimes PDF)
      if (material.fileUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = material.fileUrl;
        link.download = getFileName();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // For all URLs (Supabase, reference paths, absolute URLs)
      // Use a unified approach with proper error handling
      
      // Create a temporary anchor element to check if the URL is from the same origin
      const tempLink = document.createElement('a');
      tempLink.href = material.fileUrl;
      
      // Check if URL is absolute (has protocol) or is a Supabase URL
      const isAbsoluteUrl = /^https?:\/\//i.test(material.fileUrl);
      const isSupabaseUrl = material.fileUrl.includes('supabase.co') || material.fileUrl.includes('supabase.in');
      
      // For Supabase URLs or other external URLs that might have CORS issues,
      // we'll try to fetch with no-cors mode if the regular fetch fails
      const fetchOptions: RequestInit = {};
      
      // Try to fetch the file
      fetch(material.fileUrl, fetchOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('File not found or cannot be accessed');
          }
          return response.blob();
        })
        .then(blob => {
          // Get a more accurate filename from Content-Disposition header or URL
          let filename = '';
          
          // Try to get filename from URL
          if (material.fileUrl.includes('/')) {
            const urlParts = material.fileUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.includes('.')) {
              filename = decodeURIComponent(lastPart.split('?')[0]); // Remove query parameters
            }
          }
          
          // If we couldn't get a filename from the URL, use the generated one
          if (!filename) {
            filename = getFileName();
          }
          
          // Create a blob URL and trigger download
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl); // Clean up
        })
        .catch(error => {
          console.error('Download error:', error);
          
          // If it's a CORS error or network error for an absolute URL,
          // try opening in a new tab as a fallback
          if (isAbsoluteUrl || isSupabaseUrl) {
            console.log('Attempting to open in new tab as fallback');
            window.open(material.fileUrl, '_blank');
          } else {
            // For relative URLs that failed, show a more specific error
            alert('Failed to download file. The file may not exist or is not accessible.');
          }
        });
      
    } catch (error) {
      console.error('Error during download:', error);
      alert('Failed to download file. Please try again later.');
    }
  };

  // Generate a reasonable filename based on the material
  const getFileName = () => {
    // Try to extract filename from URL
    if (material.fileUrl.includes('/')) {
      const parts = material.fileUrl.split('/');
      const lastPart = parts[parts.length - 1];
      
      // If it has a file extension, use it
      if (lastPart.includes('.')) {
        return lastPart;
      }
    }
    
    // For base64 data, derive extension from mime type
    if (material.fileUrl.startsWith('data:')) {
      const mimeType = material.fileUrl.split(';')[0].split(':')[1];
      const extension = mimeType ? mimeType.split('/')[1] || 'file' : 'file';
      
      // Clean up the title to be filename-friendly
      const safeTitle = material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      return `${safeTitle}.${extension}`;
    }
    
    // Default: Use the material title with appropriate extension
    let extension = 'file';
    
    switch (material.type) {
      case 'pdf':
        extension = 'pdf';
        break;
      case 'audio':
        extension = 'mp3';
        break;
      case 'video':
        extension = 'mp4';
        break;
      case 'image':
        extension = 'jpg';
        break;
    }
    
    // Clean up the title to be filename-friendly
    const safeTitle = material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${safeTitle}.${extension}`;
  };

  // Get background and border colors based on material type
  const getTypeStyles = () => {
    switch (material.type) {
      case 'pdf':
        return 'border-accent-300 hover:border-accent-400 bg-accent-50';
      case 'audio':
        return 'border-secondary-300 hover:border-secondary-400 bg-secondary-50';
      case 'video':
        return 'border-primary-300 hover:border-primary-400 bg-primary-50';
      case 'image':
        return 'border-cream-300 hover:border-cream-400 bg-cream-50';
      default:
        return 'border-charcoal-300 hover:border-charcoal-400 bg-charcoal-50';
    }
  };

  // Get button colors based on material type
  const getButtonStyles = () => {
    switch (material.type) {
      case 'pdf':
        return 'bg-accent-500 hover:bg-accent-400 text-white';
      case 'audio':
        return 'bg-secondary-500 hover:bg-secondary-400 text-white';
      case 'video':
        return 'bg-primary-500 hover:bg-primary-400 text-white';
      case 'image':
        return 'bg-cream-500 hover:bg-cream-400 text-charcoal-800';
      default:
        return 'bg-charcoal-500 hover:bg-charcoal-400 text-white';
    }
  };

  return (
    <div className={`rounded-3xl shadow-md p-6 flex flex-col h-full border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${getTypeStyles()}`}>
      <div className="flex items-center mb-4">
        <div className="bg-white p-2 rounded-full shadow-md mr-3">
          {getIcon()}
        </div>
        <h3 className="text-lg font-display font-semibold text-charcoal-800">{material.title}</h3>
      </div>
      <p className="text-charcoal-600 mb-4 flex-grow font-body">{material.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-charcoal-500 font-body">{material.fileSize}</span>
        <a
          href={material.fileUrl}
          onClick={handleDownload}
          className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-300 font-medium cursor-pointer transform hover:-translate-y-1 ${getButtonStyles()}`}
        >
          <Download size={18} />
          Download
        </a>
      </div>
    </div>
  );
};

export default DownloadCard;