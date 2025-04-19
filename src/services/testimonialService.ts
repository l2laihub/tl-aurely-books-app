import { supabase } from '../lib/supabase';
import { Testimonial, TestimonialFormData } from '../types/Testimonial';

/**
 * Get all testimonials with optional pagination
 * @param page Page number (starting from 1)
 * @param pageSize Number of items per page
 * @returns Array of testimonials
 */
export async function getAllTestimonials(page = 1, pageSize = 10) {
  try {
    // Calculate offset based on page number and page size
    const offset = (page - 1) * pageSize;
    
    // Get testimonials with pagination
    const { data, error, count } = await supabase
      .from('testimonials')
      .select('*, books!inner(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }

    // Format the response to include book title
    const formattedData = data.map(item => ({
      ...item,
      book_title: item.books?.title || 'Unknown Book',
      books: undefined // Remove the books object
    }));

    return {
      testimonials: formattedData as (Testimonial & { book_title: string })[],
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    };
  } catch (err) {
    console.error('Error in getAllTestimonials:', err);
    throw err;
  }
}

/**
 * Get testimonials for a specific book
 * @param bookId Book ID
 * @param limit Maximum number of testimonials to return
 * @returns Array of testimonials for the specified book
 */
export async function getTestimonialsByBookId(bookId: string, limit?: number) {
  try {
    let query = supabase
      .from('testimonials')
      .select('*')
      .eq('book_id', bookId)
      .order('date', { ascending: false });
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching testimonials for book:', error);
      throw error;
    }

    return data as Testimonial[];
  } catch (err) {
    console.error('Error in getTestimonialsByBookId:', err);
    throw err;
  }
}

/**
 * Create a new testimonial
 * @param testimonialData Testimonial form data
 * @returns The created testimonial
 */
export async function createTestimonial(testimonialData: TestimonialFormData) {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([testimonialData])
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }

    return data as Testimonial;
  } catch (err) {
    console.error('Error in createTestimonial:', err);
    throw err;
  }
}

/**
 * Update an existing testimonial
 * @param id Testimonial ID
 * @param testimonialData Updated testimonial data
 * @returns The updated testimonial
 */
export async function updateTestimonial(id: string, testimonialData: TestimonialFormData) {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update(testimonialData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }

    return data as Testimonial;
  } catch (err) {
    console.error('Error in updateTestimonial:', err);
    throw err;
  }
}

/**
 * Delete a testimonial
 * @param id Testimonial ID
 * @returns True if deletion was successful
 */
export async function deleteTestimonial(id: string) {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteTestimonial:', err);
    throw err;
  }
}

/**
 * Get testimonial count for a specific book
 * @param bookId Book ID
 * @returns Number of testimonials for the book
 */
export async function getTestimonialCountByBookId(bookId: string) {
  try {
    const { count, error } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId);

    if (error) {
      console.error('Error getting testimonial count:', error);
      throw error;
    }

    return count || 0;
  } catch (err) {
    console.error('Error in getTestimonialCountByBookId:', err);
    throw err;
  }
}

/**
 * Get random testimonials with book information
 * @param limit Maximum number of testimonials to return
 * @param minRating Minimum rating to include (1-5)
 * @returns Array of testimonials with book information
 */
export async function getRandomTestimonials(limit = 3, minRating = 4) {
  try {
    // First get all testimonials that meet the rating criteria
    const { data, error } = await supabase
      .from('testimonials')
      .select('*, books!inner(id, title, slug)')
      .gte('rating', minRating);

    if (error) {
      console.error('Error fetching random testimonials:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Shuffle the array to get random testimonials
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    
    // Take the specified number of testimonials
    const randomTestimonials = shuffled.slice(0, limit);

    // Format the response to include book title and slug for proper URL generation
    return randomTestimonials.map(item => ({
      ...item,
      book_title: item.books?.title || 'Unknown Book',
      // Keep books object with id, title, and slug for linking
      books: item.books ? { 
        id: item.books.id, 
        title: item.books.title,
        slug: item.books.slug,
        // Generate the slugWithId format used in book URLs
        slugWithId: `${item.books.slug}-${item.books.id.substring(0, 8)}` 
      } : undefined
    }));
  } catch (err) {
    console.error('Error in getRandomTestimonials:', err);
    throw err;
  }
}
