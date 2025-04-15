/**
 * Book type definition
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publishDate: string;
  isbn: string;
  pages: number;
  ageRange: string;
  genre?: string[];
  amazonLink?: string;
  reviewLink?: string;
  downloadMaterials?: Material[];
  created_at?: string;
  updated_at?: string;
}

export interface Material {
  id: string;
  book_id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  fileSize: string;
}