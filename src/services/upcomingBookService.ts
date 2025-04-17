import { supabase } from '../lib/supabase';
import { UpcomingBook } from '../types/UpcomingBook';

export type UpcomingBookFormData = {
  id?: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;  // This will store base64 data or URL for images
  expectedReleaseDate: string;
  preorderUrl?: string;
};

// Get all upcoming books
export async function getAllUpcomingBooks(): Promise<UpcomingBook[]> {
  const { data: upcomingBooks, error } = await supabase
    .from('upcoming_books')
    .select('*')
    .order('expected_release_date', { ascending: true });

  if (error) {
    throw error;
  }

  // Map database field names to our application's camelCase conventions
  const mappedUpcomingBooks = upcomingBooks.map(book => ({
    ...book,
    coverImageUrl: book.cover_image_url,
    expectedReleaseDate: book.expected_release_date,
    preorderUrl: book.preorder_url
  }));

  return mappedUpcomingBooks;
}

// Get a single upcoming book by ID
export async function getUpcomingBookById(id: string): Promise<UpcomingBook> {
  const { data: upcomingBook, error } = await supabase
    .from('upcoming_books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  // Map database field names to our application's camelCase conventions
  const mappedUpcomingBook = {
    ...upcomingBook,
    coverImageUrl: upcomingBook.cover_image_url,
    expectedReleaseDate: upcomingBook.expected_release_date,
    preorderUrl: upcomingBook.preorder_url
  };

  return mappedUpcomingBook;
}

// Create a new upcoming book
export async function createUpcomingBook(bookData: UpcomingBookFormData): Promise<string> {
  // Map camelCase to snake_case for database fields
  const { data: book, error } = await supabase
    .from('upcoming_books')
    .insert({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      cover_image_url: bookData.coverImageUrl,
      expected_release_date: bookData.expectedReleaseDate,
      preorder_url: bookData.preorderUrl
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return book.id;
}

// Update an existing upcoming book
export async function updateUpcomingBook(id: string, bookData: UpcomingBookFormData): Promise<string> {
  // Map camelCase to snake_case for database fields
  const { error } = await supabase
    .from('upcoming_books')
    .update({
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      cover_image_url: bookData.coverImageUrl,
      expected_release_date: bookData.expectedReleaseDate,
      preorder_url: bookData.preorderUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw error;
  }

  return id;
}

// Delete an upcoming book
export async function deleteUpcomingBook(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('upcoming_books')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}