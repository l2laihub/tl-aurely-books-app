/**
 * Services for file handling, downloading, and blob management
 */

/**
 * Downloads a file from a URL or base64 string
 * @param fileUrl The URL or base64 data of the file to download
 * @param fileName Optional filename to use (will be inferred if not provided)
 */
export const downloadFile = async (fileUrl: string, fileName?: string): Promise<void> => {
  try {
    // For base64 data
    if (fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || getFileNameFromBase64(fileUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // For remote URLs, fetch first
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache'
      }),
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    // Get the file as blob
    const blob = await response.blob();
    
    // Create a blob URL and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || getFileNameFromUrl(fileUrl);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Gets an appropriate filename from a URL
 */
export const getFileNameFromUrl = (url: string): string => {
  // Try to extract filename from URL
  if (url.includes('/')) {
    // Split on '/' and get the last part
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Remove any query parameters
    if (lastPart.includes('?')) {
      return lastPart.split('?')[0];
    }
    
    // If there's a filename with extension, use it
    if (lastPart.includes('.')) {
      return lastPart;
    }
  }
  
  // Default filename with timestamp
  return `download_${Date.now()}.file`;
};

/**
 * Gets an appropriate filename from a base64 string
 */
export const getFileNameFromBase64 = (base64Data: string): string => {
  // Try to extract mime type and generate appropriate extension
  const mimeMatch = base64Data.match(/^data:([^;]+);/);
  if (mimeMatch && mimeMatch[1]) {
    const mimeType = mimeMatch[1];
    const extension = mimeType.split('/')[1] || 'file';
    return `download_${Date.now()}.${extension}`;
  }
  
  // Default fallback
  return `download_${Date.now()}.file`;
};

/**
 * Gets file extension from a filename or path
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Creates a Blob from a base64 string
 */
export const base64ToBlob = (base64Data: string): Blob => {
  // Extract mime type and actual base64 content
  const parts = base64Data.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const byteString = atob(parts[1]);
  
  // Convert base64 to blob
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([intArray], { type: mimeType });
};

export default {
  downloadFile,
  getFileNameFromUrl,
  getFileNameFromBase64,
  getFileExtension,
  base64ToBlob
};