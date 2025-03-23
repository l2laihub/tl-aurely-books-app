// This script helps save the T.L. Aurely logo image

// Function to download the image
function downloadLogo() {
  // Create a link element
  const link = document.createElement('a');
  
  // Set the download attribute with the filename
  link.download = 'tl-aurely-logo.png';
  
  // Set the href attribute to the logo image data
  // Note: The user will need to replace this with the actual image data or URL
  link.href = 'REPLACE_WITH_LOGO_IMAGE_URL_OR_DATA_URI';
  
  // Append the link to the document
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);
}

// Instructions for the user
console.log('To save the T.L. Aurely logo:');
console.log('1. Replace "REPLACE_WITH_LOGO_IMAGE_URL_OR_DATA_URI" with the actual image data or URL');
console.log('2. Run this script in a browser console or Node.js environment');
console.log('3. Save the downloaded image to the public/images directory as tl-aurely-logo.png');