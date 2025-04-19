# Testimonial Management Feature - Technical Specification

## Overview
This document provides technical details for implementing the testimonial management feature in the Aurely Books application. The feature will allow admins to manage book testimonials/reviews and display them on the book detail pages.

## Database Schema

### Testimonials Table
```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  date DATE NOT NULL,
  source TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to perform all operations
CREATE POLICY "Admins can do all operations" 
ON testimonials 
FOR ALL 
TO authenticated 
USING (true);

-- Allow public read access
CREATE POLICY "Public can view testimonials" 
ON testimonials 
FOR SELECT 
TO anon 
USING (true);
```

## Type Definitions

### Testimonial Interface
```typescript
// src/types/Testimonial.ts
export interface Testimonial {
  id: string;
  book_id: string;
  reviewer_name: string;
  rating: number;
  content: string;
  date: string;
  source?: string;
  verified_purchase?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TestimonialFormData = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
```

## Service Implementation

### Testimonial Service
```typescript
// src/services/testimonialService.ts
import { supabase } from '../lib/supabase';
import { Testimonial, TestimonialFormData } from '../types/Testimonial';

// Get all testimonials
export async function getAllTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Testimonial[];
}

// Get testimonials for a specific book
export async function getTestimonialsByBookId(bookId: string) {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('book_id', bookId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Testimonial[];
}

// Create a new testimonial
export async function createTestimonial(testimonialData: TestimonialFormData) {
  const { data, error } = await supabase
    .from('testimonials')
    .insert([testimonialData])
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

// Update an existing testimonial
export async function updateTestimonial(id: string, testimonialData: TestimonialFormData) {
  const { data, error } = await supabase
    .from('testimonials')
    .update(testimonialData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

// Delete a testimonial
export async function deleteTestimonial(id: string) {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
```

## UI Components

### Admin Testimonials Page
The admin testimonials page will list all testimonials across all books with filtering and search capabilities.

Key features:
- Filter by book
- Search by reviewer name or content
- Sort by date, rating, or book
- Pagination for large datasets

### Testimonial Form Component
The form will include:
- Book selector (dropdown)
- Reviewer name input
- Rating selector (1-5 stars)
- Content textarea
- Date picker
- Source input (optional)
- Verified purchase checkbox

### Testimonial Display Component
The component will display:
- Reviewer name
- Rating (visual star representation)
- Date
- Content
- Source (if provided)
- Verified purchase badge (if applicable)

## Integration Points

### Book Detail Page
- Add testimonials section below book description
- Show 3-5 most recent testimonials
- Add "See more reviews" button if more testimonials exist
- Include "View all reviews on Amazon" link if amazonLink is available

### Admin Book Form
- Add testimonials tab in the book edit form
- Allow adding/editing/deleting testimonials directly from the book form
- Show testimonial count in the tab label

## Testing Strategy

### Unit Tests
- Test all CRUD operations in testimonialService
- Test form validation
- Test UI components in isolation

### Integration Tests
- Test testimonial display on book detail page
- Test admin workflow for managing testimonials

## Performance Considerations
- Implement pagination for testimonials to handle books with many reviews
- Consider caching testimonials for frequently viewed books
- Use optimistic UI updates for better user experience

## Security Considerations
- Ensure proper RLS policies are in place
- Validate input on both client and server
- Sanitize user-generated content before display
