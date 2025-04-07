import { supabase } from '../lib/supabase';
import { uploadFileToStorage } from '../lib/supabase';
import { convertFileToBase64 } from '../services/bookService';

export type AuthorData = {
  id: string; // Using the author name as ID for now
  name: string;
  bookCount: number;
};

export type AuthorProfileData = {
  id?: string;
  name: string;
  title: string;
  photo_url: string;
  bio: string[];
  quote: string;
  creative_process: string[];
};

/**
 * Get all unique authors from the books table
 */
export async function getAllAuthors(): Promise<AuthorData[]> {
  // Get all books to extract author information
  const { data: books, error } = await supabase
    .from('books')
    .select('id, author')
    .order('author', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }

  // Extract unique authors and count their books
  const authorMap = new Map<string, AuthorData>();
  
  books.forEach(book => {
    if (!book.author) return; // Skip books with no author
    
    if (authorMap.has(book.author)) {
      // Increment book count for existing author
      const authorData = authorMap.get(book.author)!;
      authorData.bookCount++;
    } else {
      // Add new author
      authorMap.set(book.author, {
        id: book.author, // Using the name as ID for now
        name: book.author,
        bookCount: 1
      });
    }
  });

  // Convert map to array
  return Array.from(authorMap.values());
}

/**
 * Update author name across all books
 */
export async function updateAuthorName(oldName: string, newName: string): Promise<boolean> {
  if (!oldName || !newName) {
    throw new Error('Both old and new author names are required');
  }

  // Find all books by this author
  const { data: books, error: fetchError } = await supabase
    .from('books')
    .select('id')
    .eq('author', oldName);

  if (fetchError) {
    console.error('Error fetching books by author:', fetchError);
    throw fetchError;
  }

  if (!books || books.length === 0) {
    throw new Error(`No books found for author: ${oldName}`);
  }

  // Update all books with this author
  const { error: updateError } = await supabase
    .from('books')
    .update({ author: newName })
    .eq('author', oldName);

  if (updateError) {
    console.error('Error updating author name:', updateError);
    throw updateError;
  }

  return true;
}

/**
 * Delete an author by updating all their books to have no author
 * or alternatively reassign to another author
 */
export async function deleteAuthor(authorName: string, reassignTo?: string): Promise<boolean> {
  if (!authorName) {
    throw new Error('Author name is required');
  }

  // Update all books by this author
  const { error: updateError } = await supabase
    .from('books')
    .update({ author: reassignTo || '' })
    .eq('author', authorName);

  if (updateError) {
    console.error('Error deleting author:', updateError);
    throw updateError;
  }

  return true;
}

/**
 * Get author profile information
 */
export async function getAuthorProfile(): Promise<AuthorProfileData | null> {
  try {
    // Get all author profiles and use the first one
    // This handles the case where there might be multiple records
    const { data, error } = await supabase
      .from('author_info')
      .select('*')
      .order('created_at', { ascending: false })  // Get the most recently created one
      .limit(1);

    if (error) {
      console.error('Error fetching author profile:', error);
      // Return default profile instead of throwing error
      return getDefaultAuthorProfile();
    }

    if (!data || data.length === 0) {
      console.log('No author profile found, using default');
      return getDefaultAuthorProfile();
    }

    // Use the first author profile in the results
    const authorData = data[0];
    
    // Format the data to match our expected structure
    return {
      id: authorData.id,
      name: authorData.name,
      title: authorData.title,
      photo_url: authorData.photo_url,
      bio: authorData.bio || [],
      quote: authorData.quote,
      creative_process: authorData.creative_process || [],
    };
  } catch (err) {
    console.error('Unexpected error in getAuthorProfile:', err);
    return getDefaultAuthorProfile();
  }
}

/**
 * Get default author profile when database fetch fails
 */
function getDefaultAuthorProfile(): AuthorProfileData {
  return {
    name: "T.L. Aurely",
    title: "Award-winning children's book author & educator",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    bio: [
      "T.L. Aurely is a passionate educator and storyteller dedicated to creating books that make learning fun and engaging for young readers. With a background in early childhood education and a love for colorful illustrations, T.L. brings educational concepts to life through captivating stories and lovable characters.",
      "After teaching kindergarten for over 10 years, T.L. recognized the need for children's books that blend entertainment with valuable learning experiences. This inspired the creation of a series of children's books that help develop essential skills while sparking imagination and curiosity.",
      "When not writing or illustrating, T.L. can be found conducting interactive story time sessions at libraries and schools, designing new educational activities, and playing with a rescue dog named Scribbles who often serves as inspiration for book characters."
    ],
    quote: "I believe that every child has a unique spark of curiosity and creativity. My goal as an author is to nurture that spark through stories that entertain while they educate.",
    creative_process: [
      "T.L. Aurely's creative process begins with identifying key learning concepts that children find challenging or particularly exciting. Research with educators and child development experts helps shape these concepts into age-appropriate stories.",
      "Characters are designed to be relatable and diverse, ensuring all children can see themselves in the stories. Each character has distinctive traits that help reinforce the educational concepts being explored.",
      "T.L. tests each story with groups of children before finalizing the manuscripts, observing their engagement and comprehension. The downloadable materials are developed alongside the story to reinforce learning objectives and provide extended activities for the home or classroom."
    ]
  };
}

/**
 * Save author profile information
 */
export async function saveAuthorProfile(profileData: AuthorProfileData): Promise<string> {
  const { id, ...data } = profileData;

  try {
    if (id) {
      // Update existing profile
      const { data: updatedData, error } = await supabase
        .from('author_info')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating author profile:', error);
        throw error;
      }

      return updatedData.id;
    } else {
      // Create new profile
      const { data: newData, error } = await supabase
        .from('author_info')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating author profile:', error);
        throw error;
      }

      return newData.id;
    }
  } catch (err) {
    console.error('Failed to save author profile:', err);
    throw new Error('Failed to save author profile. Please try again.');
  }
}

/**
 * Upload author photo and get the URL
 */
export async function uploadAuthorPhoto(file: File): Promise<string> {
  try {
    if (!file) throw new Error('No file provided');

    if (file.type.startsWith('image/')) {
      // For images, first try uploading to storage bucket
      try {
        const publicUrl = await uploadFileToStorage(file, 'covers');
        return publicUrl;
      } catch (storageError) {
        console.error('Storage upload failed, falling back to base64:', storageError);
        // Fallback to base64 if storage fails
        const base64Data = await convertFileToBase64(file);
        return base64Data;
      }
    } else {
      throw new Error('File must be an image');
    }
  } catch (err) {
    console.error('Error uploading author photo:', err);
    throw err;
  }
}
