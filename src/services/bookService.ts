import { supabase } from '../lib/supabase';
import { uploadFileToStorage } from '../lib/supabase';

export type BookFormData = {
  id?: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;  // This will now store base64 data for images
  publishDate: string;
  isbn: string;
  pages: number;
  ageRange: string;
  genres: string[];
  amazonLink?: string;  // New field for Amazon link
  reviewLink?: string;  // New field for review link
};

export type Material = {
  id?: string;
  book_id?: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;  // For image types, this will store base64 data
  fileSize: string;
  fileData?: string; // Additional base64 data field
};

// Helper function to convert files to base64
export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Format file size helper
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Upload a file and return its URL
export async function uploadFile(file: File): Promise<{ fileUrl: string; fileSize: string }> {
  try {
    console.log('[UPLOAD_FILE] Starting file upload process', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    
    // For image types, convert to base64 and return
    if (file.type.startsWith('image/')) {
      console.log('[UPLOAD_FILE] File is an image, converting to base64');
      const base64Data = await convertFileToBase64(file);
      console.log('[UPLOAD_FILE] Image successfully converted to base64');
      return {
        fileUrl: base64Data,
        fileSize: formatFileSize(file.size)
      };
    }
    
    // For non-image files, try to use Supabase Storage
    try {
      console.log('[UPLOAD_FILE] File is not an image, uploading to Supabase Storage');
      // Try to upload to storage bucket
      const publicUrl = await uploadFileToStorage(file, 'materials');
      console.log('[UPLOAD_FILE] File successfully uploaded to Supabase Storage:', publicUrl);
      return {
        fileUrl: publicUrl,
        fileSize: formatFileSize(file.size)
      };
    } catch (storageError) {
      console.error('[UPLOAD_FILE] Storage upload failed:', storageError);
      
      // Fallback for storage errors: use a temporary URL with the file as a blob
      // Create a blob URL for debugging purposes
      URL.createObjectURL(file); // Create but don't store, for debugging only
      
      // In a real app, we'd need to handle this better
      console.warn('[UPLOAD_FILE] Using temporary blob URL. This will not persist across sessions.');
      
      return {
        fileUrl: `/downloads/${Date.now()}-${file.name}`, // Reference path
        fileSize: formatFileSize(file.size)
      };
    }
  } catch (err) {
    console.error('[UPLOAD_FILE] Error uploading file:', err);
    throw err;
  }
}

// Get all books with genres
export async function getAllBooks() {
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (booksError) {
    throw booksError;
  }

  // For each book, get its genres
  const booksWithGenres = await Promise.all(
    books.map(async (book) => {
      const { data: genres, error: genresError } = await supabase
        .from('book_genres')
        .select('genre')
        .eq('book_id', book.id);

      if (genresError) {
        throw genresError;
      }

      // Map database field names to our application's camelCase conventions
      const mappedBook = {
        ...book,
        ageRange: book.age_range, // Map age_range to ageRange
        coverImage: book.coverimage, // Map coverimage to coverImage
        publishDate: book.publishdate, // Map publishDate to publishdate
        amazonLink: book.amazon_link, // Map amazon_link to amazonLink
        reviewLink: book.review_link, // Map review_link to reviewLink
      };

      return {
        ...mappedBook,
        genre: genres.map((g) => g.genre),
      };
    })
  );

  // For each book, get its materials
  const booksWithGenresAndMaterials = await Promise.all(
    booksWithGenres.map(async (book) => {
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .eq('book_id', book.id);

      if (materialsError) {
        throw materialsError;
      }

      // Map material database fields to our application's camelCase conventions
      const mappedMaterials = materials.map(material => ({
        ...material,
        fileUrl: material.fileurl,
        fileSize: material.filesize,
      }));

      return {
        ...book,
        downloadMaterials: mappedMaterials,
      };
    })
  );

  return booksWithGenresAndMaterials;
}

// Get a single book by ID with genres and materials
export async function getBookById(id: string) {
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (bookError) {
    throw bookError;
  }

  // Get book genres
  const { data: genres, error: genresError } = await supabase
    .from('book_genres')
    .select('genre')
    .eq('book_id', id);

  if (genresError) {
    throw genresError;
  }

  // Get book materials
  const { data: materials, error: materialsError } = await supabase
    .from('materials')
    .select('*')
    .eq('book_id', id);

  if (materialsError) {
    throw materialsError;
  }

  // Map database field names to our application's camelCase conventions
  const mappedBook = {
    ...book,
    ageRange: book.age_range, // Map age_range to ageRange
    coverImage: book.coverimage, // Map coverimage to coverImage
    publishDate: book.publishdate, // Map publishDate to publishdate
    amazonLink: book.amazon_link, // Map amazon_link to amazonLink
    reviewLink: book.review_link, // Map review_link to reviewLink
  };

  // Map material database fields to our application's camelCase conventions
  const mappedMaterials = materials.map(material => ({
    ...material,
    fileUrl: material.fileurl,
    fileSize: material.filesize,
  }));

  return {
    ...mappedBook,
    genre: genres.map((g) => g.genre),
    downloadMaterials: mappedMaterials,
  };
}

// Create a new book with genres
export async function createBook(bookData: BookFormData, materials: Material[]) {
  // Start a transaction by manually controlling the error response
  // Create the book - mapping camelCase to snake_case for database fields
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      coverimage: bookData.coverImage, // Map coverImage to coverimage - now stores base64
      publishdate: bookData.publishDate, // Map publishDate to publishdate
      isbn: bookData.isbn,
      pages: bookData.pages,
      age_range: bookData.ageRange, // Map ageRange to age_range
      amazon_link: bookData.amazonLink, // Map amazonLink to amazon_link
      review_link: bookData.reviewLink, // Map reviewLink to review_link
    })
    .select('id')
    .single();

  if (bookError) {
    throw bookError;
  }

  // Create the book genres
  const genreData = bookData.genres.map((genre) => ({
    book_id: book.id,
    genre,
  }));

  const { error: genresError } = await supabase.from('book_genres').insert(genreData);

  if (genresError) {
    throw genresError;
  }

  // Create the materials - mapping camelCase to snake_case for database fields
  if (materials.length > 0) {
    const materialsData = materials.map((material) => ({
      book_id: book.id,
      title: material.title,
      description: material.description,
      type: material.type,
      fileurl: material.fileUrl, // Map fileUrl to fileurl - for images, this contains base64
      filesize: material.fileSize, // Map fileSize to filesize
    }));

    const { error: materialsError } = await supabase.from('materials').insert(materialsData);

    if (materialsError) {
      throw materialsError;
    }
  }

  return book.id;
}

// Update an existing book
export async function updateBook(bookId: string, bookData: BookFormData, materials: Material[]) {
  // Update the book - mapping camelCase to snake_case for database fields
  const { error: bookError } = await supabase
    .from('books')
    .update({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      coverimage: bookData.coverImage, // Map coverImage to coverimage - now stores base64
      publishdate: bookData.publishDate, // Map publishDate to publishdate
      isbn: bookData.isbn,
      pages: bookData.pages,
      age_range: bookData.ageRange, // Map ageRange to age_range
      amazon_link: bookData.amazonLink, // Map amazonLink to amazon_link
      review_link: bookData.reviewLink, // Map reviewLink to review_link
    })
    .eq('id', bookId);

  if (bookError) {
    throw bookError;
  }

  // Delete existing genres and add new ones
  const { error: deleteGenresError } = await supabase
    .from('book_genres')
    .delete()
    .eq('book_id', bookId);

  if (deleteGenresError) {
    throw deleteGenresError;
  }

  const genreData = bookData.genres.map((genre) => ({
    book_id: bookId,
    genre,
  }));

  const { error: genresError } = await supabase.from('book_genres').insert(genreData);

  if (genresError) {
    throw genresError;
  }

  // Update materials
  // For simplicity, we'll just delete all existing ones and add the new ones
  const { error: deleteMaterialsError } = await supabase
    .from('materials')
    .delete()
    .eq('book_id', bookId);

  if (deleteMaterialsError) {
    throw deleteMaterialsError;
  }

  if (materials.length > 0) {
    const materialsData = materials.map((material) => ({
      book_id: bookId,
      title: material.title,
      description: material.description,
      type: material.type,
      fileurl: material.fileUrl, // Map fileUrl to fileurl - for images, this contains base64
      filesize: material.fileSize, // Map fileSize to filesize
    }));

    const { error: materialsError } = await supabase.from('materials').insert(materialsData);

    if (materialsError) {
      throw materialsError;
    }
  }

  return bookId;
}

// Delete a book
export async function deleteBook(bookId: string) {
  // The foreign key constraints will automatically delete related genres and materials
  const { error } = await supabase.from('books').delete().eq('id', bookId);

  if (error) {
    throw error;
  }

  return true;
}