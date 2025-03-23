import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These would normally be in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Helper function to upload files to Supabase Storage
export async function uploadFileToStorage(file: File, bucket: string, path?: string): Promise<string> {
  console.log('TEST LOG: uploadFileToStorage function called', { file, bucket, path });
  
  try {
    // Create a simple file name with timestamp to avoid conflicts
    // Sanitize the filename to remove special characters that could cause issues with storage paths
    
    // First, strip all types of quotes, apostrophes, and other problematic characters
    let sanitizedFileName = file.name
      .replace(/[''"'"''‚‛""„‟]/g, '') // Remove all types of quotes and apostrophes including Unicode variants
      .replace(/[&\\#,+()$~%.:*?<>{}]/g, '_') // Replace other special chars with underscore
      .replace(/\s+/g, '_'); // Replace spaces with underscores
    
    // For extra safety, encode the filename to handle any remaining special characters
    sanitizedFileName = sanitizedFileName
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/[^\w.-]/g, '_'); // Replace any non-word chars (except dots and hyphens) with underscores
    
    const fileName = `${Date.now()}_${sanitizedFileName}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    console.log(`[UPLOAD] Starting upload process for file:`, {
      fileName,
      filePath,
      bucket,
      fileType: file.type,
      fileSize: file.size
    });
    
    // Skip bucket verification and use the specified bucket directly
    console.log(`[UPLOAD] Using bucket '${bucket}' for upload`);
    
    // Check Supabase connection and authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[UPLOAD] Authentication error:', sessionError);
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    console.log('[UPLOAD] Authentication status:', sessionData.session ? 'Authenticated' : 'Not authenticated');
    
    // Direct upload to the bucket
    console.log(`[UPLOAD] Uploading file to ${bucket}/${filePath}`);
    
    // Try with explicit content type
    const options = {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'application/octet-stream'
    };
    
    console.log('[UPLOAD] Upload options:', options);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, options);
    
    if (error) {
      console.error(`[UPLOAD] Error uploading file to ${bucket}/${filePath}:`, error);
      
      // Check if error is related to permissions
      if (error.message.includes('permission') || error.message.includes('not authorized')) {
        console.error('[UPLOAD] This appears to be a permissions error. Check Supabase storage bucket policies.');
      }
      
      throw error;
    }
    
    console.log(`[UPLOAD] File uploaded successfully:`, data);
    
    // Verify the file was uploaded by listing the bucket contents
    console.log(`[UPLOAD] Verifying file exists in bucket '${bucket}'`);
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucket)
      .list(path || '');
      
    if (listError) {
      console.error(`[UPLOAD] Error listing files in bucket:`, listError);
    } else {
      const uploadedFile = fileList.find(f => f.name === fileName);
      console.log(`[UPLOAD] File verification:`, {
        fileFound: !!uploadedFile,
        fileDetails: uploadedFile || 'Not found',
        allFiles: fileList.map(f => f.name)
      });
    }
    
    // Get public URL
    console.log(`[UPLOAD] Generating public URL for ${data.path}`);
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    console.log('[UPLOAD] Generated public URL:', urlData.publicUrl);
    
    // Verify the URL is accessible
    try {
      console.log(`[UPLOAD] Verifying URL is accessible: ${urlData.publicUrl}`);
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
      console.log(`[UPLOAD] URL verification status:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
    } catch (fetchError) {
      console.warn(`[UPLOAD] URL verification failed:`, fetchError);
      // Don't throw here, just log the warning
    }
    
    return urlData.publicUrl;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[UPLOAD] Error in uploadFileToStorage:', error);
    
    // Log additional debugging information
    console.error('[UPLOAD] Debug info:', {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
      file: file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : 'No file provided',
      bucket,
      path
    });
    
    throw new Error(`Failed to upload file: ${errorMessage}`);
  }
}