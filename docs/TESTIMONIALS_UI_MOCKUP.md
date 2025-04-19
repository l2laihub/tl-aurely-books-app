# Testimonial Management Feature - UI Mockups

## Admin Testimonials List Page

```
+----------------------------------------------------------------------+
| Admin Dashboard                                                       |
+----------------------------------------------------------------------+
| [Sidebar]  | Testimonials                                   [+ Add]   |
|            |                                                          |
| Dashboard  | Filter by: [Book ▼]  Search: [____________] [Search]     |
| Books      |                                                          |
| Authors    | +----------------------------------------------------------+
| Materials  | | Book          | Reviewer      | Rating | Date      | Actions |
| Multimedia | +----------------------------------------------------------+
| Testimonials| | The Kind... | Jane Smith    | ★★★★★  | 2025-03-15 | [✎][🗑️] |
|            | | The Kind... | John Doe      | ★★★★☆  | 2025-02-28 | [✎][🗑️] |
|            | | Brave He... | Sarah Johnson | ★★★★★  | 2025-04-01 | [✎][🗑️] |
|            | | Brave He... | Michael Brown | ★★★☆☆  | 2025-03-20 | [✎][🗑️] |
|            | | Ocean Ad... | Emily Wilson  | ★★★★☆  | 2025-03-10 | [✎][🗑️] |
|            | +----------------------------------------------------------+
|            |                                                          |
|            | [< 1 2 3 ... >]                                          |
+----------------------------------------------------------------------+
```

## Testimonial Form

```
+----------------------------------------------------------------------+
| [✕] Add/Edit Testimonial                                              |
+----------------------------------------------------------------------+
|                                                                      |
| Book*:        [The Kind Koala ▼]                                     |
|                                                                      |
| Reviewer Name*: [_________________________]                          |
|                                                                      |
| Rating*:      [★][★][★][★][★]                                        |
|                                                                      |
| Date*:        [MM/DD/YYYY_____]                                      |
|                                                                      |
| Source:       [_________________________]                            |
|                                                                      |
| Verified Purchase: [✓]                                               |
|                                                                      |
| Content*:                                                            |
| +------------------------------------------------------------------+ |
| |                                                                  | |
| |                                                                  | |
| |                                                                  | |
| +------------------------------------------------------------------+ |
|                                                                      |
| [Cancel]                                   [Save Testimonial]        |
+----------------------------------------------------------------------+
```

## Book Detail Page with Testimonials

```
+----------------------------------------------------------------------+
| The Kind Koala                                                        |
+----------------------------------------------------------------------+
| [Book Cover]  | The Kind Koala                                        |
|               | by Author Name                                        |
|               |                                                       |
|               | Description: Lorem ipsum dolor sit amet...            |
|               |                                                       |
|               | Age Range: 4-8                                        |
|               | Pages: 32                                             |
|               | Published: January 2025                               |
|               |                                                       |
|               | [Buy on Amazon]                                       |
+----------------------------------------------------------------------+
| Materials                                                             |
+----------------------------------------------------------------------+
| [Download Activity Sheets]  [Download Coloring Pages]                 |
+----------------------------------------------------------------------+
| Testimonials                                                          |
+----------------------------------------------------------------------+
| ★★★★★                                                                |
| "This book was amazing! My kids loved it and asked to read it         |
| every night."                                                         |
| - Jane Smith, Amazon Verified Purchase                                |
| March 15, 2025                                                        |
|                                                                       |
| ★★★★☆                                                                |
| "Great illustrations and engaging story. Would recommend for          |
| ages 5-8."                                                            |
| - John Doe, Goodreads                                                 |
| February 28, 2025                                                     |
|                                                                       |
| [See More Reviews]                                                    |
| [View All Reviews on Amazon]                                          |
+----------------------------------------------------------------------+
```

## Book Edit Form with Testimonials Tab

```
+----------------------------------------------------------------------+
| Edit Book: The Kind Koala                                             |
+----------------------------------------------------------------------+
| [Details] [Materials] [Testimonials]                                  |
+----------------------------------------------------------------------+
| Testimonials (3)                                  [+ Add Testimonial] |
|                                                                       |
| +-------------------------------------------------------------------+ |
| | Reviewer: Jane Smith                                       [✎][🗑️] | |
| | ★★★★★  March 15, 2025  Amazon (Verified Purchase)                 | |
| | "This book was amazing! My kids loved it and asked to read it      | |
| | every night."                                                      | |
| +-------------------------------------------------------------------+ |
|                                                                       |
| +-------------------------------------------------------------------+ |
| | Reviewer: John Doe                                         [✎][🗑️] | |
| | ★★★★☆  February 28, 2025  Goodreads                               | |
| | "Great illustrations and engaging story. Would recommend for       | |
| | ages 5-8."                                                         | |
| +-------------------------------------------------------------------+ |
|                                                                       |
| +-------------------------------------------------------------------+ |
| | Reviewer: Sarah Johnson                                    [✎][🗑️] | |
| | ★★★★★  April 1, 2025  Amazon (Verified Purchase)                  | |
| | "Beautiful message about kindness. This book has become a family   | |
| | favorite."                                                         | |
| +-------------------------------------------------------------------+ |
|                                                                       |
| [Cancel]                                             [Save Changes]   |
+----------------------------------------------------------------------+
```

## Mobile View - Testimonials on Book Detail Page

```
+----------------------+
| The Kind Koala       |
+----------------------+
| [Book Cover]         |
|                      |
| by Author Name       |
|                      |
| Description: Lorem   |
| ipsum dolor sit...   |
|                      |
| [Buy on Amazon]      |
+----------------------+
| Testimonials         |
+----------------------+
| ★★★★★                |
| "This book was       |
| amazing! My kids     |
| loved it and asked   |
| to read it every     |
| night."              |
| - Jane Smith         |
| Amazon Verified      |
| March 15, 2025       |
|                      |
| ★★★★☆                |
| "Great illustrations |
| and engaging story.  |
| Would recommend for  |
| ages 5-8."           |
| - John Doe           |
| Goodreads            |
| February 28, 2025    |
|                      |
| [See More Reviews]   |
| [View All on Amazon] |
+----------------------+
```

## Component Structure

### Testimonial List Component
```tsx
<TestimonialList 
  testimonials={bookTestimonials} 
  maxDisplay={3} 
  showMoreLink={true}
  amazonLink={book.amazonLink}
/>
```

### Testimonial Card Component
```tsx
<TestimonialCard
  testimonial={testimonial}
  showActions={isAdmin}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Star Rating Component
```tsx
// Display only
<StarRating rating={4.5} maxRating={5} readOnly={true} />

// Interactive for form
<StarRating 
  rating={formData.rating} 
  maxRating={5} 
  readOnly={false}
  onChange={(newRating) => setFormData({...formData, rating: newRating})}
/>
```
