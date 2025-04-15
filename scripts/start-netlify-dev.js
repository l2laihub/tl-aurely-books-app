/**
 * Script to start Netlify dev server with environment variables from .env.development
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to .env.development file
const envFilePath = path.join(__dirname, '..', '.env.development');

// Check if .env.development exists
if (!fs.existsSync(envFilePath)) {
  console.warn('Warning: .env.development file not found. Environment variables may not be loaded correctly.');
} else {
  console.log('Found .env.development file. Loading environment variables...');
  
  // Read and parse .env.development file
  const envFileContent = fs.readFileSync(envFilePath, 'utf8');
  const envVars = {};
  
  // Parse each line
  envFileContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    // Split by first equals sign
    const equalSignIndex = line.indexOf('=');
    if (equalSignIndex > 0) {
      const key = line.substring(0, equalSignIndex).trim();
      const value = line.substring(equalSignIndex + 1).trim();
      
      // Remove quotes if present
      const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
      
      // Add to environment variables
      envVars[key] = cleanValue;
      
      // Also set in process.env for this process
      process.env[key] = cleanValue;
    }
  });
  
  console.log('Loaded environment variables:', Object.keys(envVars).join(', '));
}

// Start Netlify dev server
console.log('Starting Netlify dev server...');

// Create child process for netlify dev
const netlifyDev = spawn('netlify', ['dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Handle process exit
netlifyDev.on('close', (code) => {
  console.log(`Netlify dev server exited with code ${code}`);
  process.exit(code);
});

// Handle process errors
netlifyDev.on('error', (err) => {
  console.error('Failed to start Netlify dev server:', err);
  process.exit(1);
});