/**
 * Testimonial type definitions
 */

export interface Testimonial {
  id: string;
  book_id: string;
  reviewer_name: string;
  rating: number;
  title?: string; // Optional review title
  content: string;
  date: string;
  source?: string;
  verified_purchase?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Form data type for creating/updating testimonials
 * Omits auto-generated fields
 */
export type TestimonialFormData = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
