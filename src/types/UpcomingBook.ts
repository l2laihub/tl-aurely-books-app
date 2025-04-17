/**
 * UpcomingBook type definition
 */

export interface UpcomingBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  expectedReleaseDate: string;
  preorderUrl?: string;
  created_at?: string;
  updated_at?: string;
}