import { supabase } from '../lib/supabase';

export type MultimediaContent = {
  id: string;
  book_id: string;
  title: string;
  description: string;
  type: 'video' | 'audio';
  url: string;
  thumbnail: string;
  lyrics?: string;
  created_at?: string;
};

// Get all multimedia content for a specific book
export async function getMultimediaByBookId(bookId: string): Promise<MultimediaContent[]> {
  try {
    const { data, error } = await supabase
      .from('multimedia')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching multimedia:', error);
      // Return empty array instead of throwing, allowing the page to gracefully handle no results
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getMultimediaByBookId:', err);
    return [];
  }
}

// Create new multimedia content
export async function createMultimedia(multimedia: Omit<MultimediaContent, 'id' | 'created_at'>): Promise<string> {
  const { data, error } = await supabase
    .from('multimedia')
    .insert(multimedia)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating multimedia:', error);
    throw error;
  }

  return data.id;
}

// Update existing multimedia content
export async function updateMultimedia(id: string, multimedia: Partial<Omit<MultimediaContent, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase
    .from('multimedia')
    .update(multimedia)
    .eq('id', id);

  if (error) {
    console.error('Error updating multimedia:', error);
    throw error;
  }
}

// Delete multimedia content
export async function deleteMultimedia(id: string): Promise<void> {
  const { error } = await supabase
    .from('multimedia')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting multimedia:', error);
    throw error;
  }
}

// Check if multimedia table exists and add sample content if empty
export async function initializeMultimediaData(): Promise<void> {
  try {
    // Check if the multimedia table exists
    const { count, error } = await supabase
      .from('multimedia')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Table might not exist yet or other error
      console.error('Error checking multimedia table:', error);
      return;
    }

    // If the table has content, no need to add samples
    if (count && count > 0) {
      return;
    }

    // Get all books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id');

    if (booksError || !books || books.length === 0) {
      console.error('No books found to add multimedia content');
      return;
    }

    // For each book, add sample multimedia content
    for (const book of books) {
      const sampleContent = getSampleMultimediaContent(book.id);
      
      // Insert all sample content
      const { error: insertError } = await supabase
        .from('multimedia')
        .insert(sampleContent);

      if (insertError) {
        console.error('Error inserting sample multimedia content:', insertError);
      } else {
        console.log(`Added sample multimedia content for book ${book.id}`);
      }
    }
  } catch (err) {
    console.error('Error initializing multimedia data:', err);
  }
}

// Helper function to generate sample multimedia content for a book
function getSampleMultimediaContent(bookId: string): Omit<MultimediaContent, 'id' | 'created_at'>[] {
  return [
    {
      book_id: bookId,
      type: 'video',
      title: 'Book Introduction',
      description: 'A short introduction to the characters and story.',
      url: 'https://www.youtube.com/watch?v=20-3SconM1k', // YouTube example
      thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      book_id: bookId,
      type: 'video',
      title: 'Animated Story - Chapter 1',
      description: 'The first chapter of the story animated for young viewers.',
      url: 'https://vimeo.com/1065345130', // Vimeo example (using a valid ID)
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3710bc10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      book_id: bookId,
      type: 'audio',
      title: 'Theme Song',
      description: 'The catchy theme song that accompanies the book.',
      url: 'https://suno.com/song/34bf2c2f-9113-4aab-ab4b-cd7770ee86f7?sh=87tU5y6ZXlkWWJoz', // Suno example
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      book_id: bookId,
      type: 'audio',
      title: 'Audiobook Narration',
      description: 'Listen to the complete story narrated by the author.',
      url: 'https://soundcloud.com/user-861303933/relaxing-sleep-music', // SoundCloud example
      thumbnail: 'https://images.unsplash.com/photo-1519552928909-67ca7aef9265?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];
}

// Get valid Vimeo ID from URL for fixed demo purposes
export function getValidVimeoId(vimeoUrl: string): string {
  if (vimeoUrl.includes('1065345130')) {
    // This is a placeholder/invalid ID, replace with a valid one for the demo
    return '824804225'; // Example: https://vimeo.com/824804225
  }
  
  // Otherwise, try to extract the actual ID
  const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
  const match = vimeoUrl.match(vimeoRegex);
  return match ? match[1] : '824804225'; // fallback to a valid ID
}