const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to download an image from a URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Image downloaded and saved to: ${filepath}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there's an error
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download image. Status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to save a base64 image
function saveBase64Image(base64String, filepath) {
  return new Promise((resolve, reject) => {
    try {
      // Remove the data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      
      // Create buffer from base64 data
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Write buffer to file
      fs.writeFile(filepath, buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Image saved to: ${filepath}`);
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Main function
async function main() {
  const targetDir = path.join(__dirname, '..', 'public', 'images');
  const targetFile = path.join(targetDir, 'tl-aurely-logo.png');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }
  
  console.log('\n=== T.L. Aurely Logo Saver ===\n');
  console.log('This script will help you save the T.L. Aurely logo to the correct location.');
  console.log('You can provide either a URL or a base64 string of the logo image.\n');
  
  rl.question('Do you have a URL or a base64 string? (url/base64): ', async (answer) => {
    if (answer.toLowerCase() === 'url') {
      rl.question('Enter the URL of the logo image: ', async (url) => {
        try {
          await downloadImage(url, targetFile);
          console.log('\nSuccess! The logo has been saved to the correct location.');
          console.log('You can now run the application to see the updated logo in the header.');
        } catch (err) {
          console.error('Error downloading image:', err.message);
        } finally {
          rl.close();
        }
      });
    } else if (answer.toLowerCase() === 'base64') {
      console.log('Paste the base64 string of the logo image:');
      let base64String = '';
      
      // Use a different approach to read multiline input
      process.stdin.on('data', async (data) => {
        base64String += data.toString();
        
        // Check if the input seems complete (this is a simple heuristic)
        if (base64String.length > 100 && base64String.includes('=')) {
          try {
            await saveBase64Image(base64String.trim(), targetFile);
            console.log('\nSuccess! The logo has been saved to the correct location.');
            console.log('You can now run the application to see the updated logo in the header.');
          } catch (err) {
            console.error('Error saving image:', err.message);
          } finally {
            rl.close();
            process.stdin.pause();
          }
        }
      });
    } else {
      console.log('Invalid option. Please run the script again and choose either "url" or "base64".');
      rl.close();
    }
  });
}

// Run the main function
main();