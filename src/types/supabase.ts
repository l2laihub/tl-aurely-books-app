export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string
          description: string
          coverimage: string
          publishdate: string
          isbn: string
          pages: number
          age_range: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          description: string
          coverimage: string
          publishdate: string
          isbn: string
          pages: number
          age_range: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          description?: string
          coverimage?: string
          publishdate?: string
          isbn?: string
          pages?: number
          age_range?: string
          created_at?: string
        }
      }
      book_genres: {
        Row: {
          id: string
          book_id: string
          genre: string
        }
        Insert: {
          id?: string
          book_id: string
          genre: string
        }
        Update: {
          id?: string
          book_id?: string
          genre?: string
        }
      }
      materials: {
        Row: {
          id: string
          book_id: string
          title: string
          description: string
          type: string
          fileurl: string
          filesize: string
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          title: string
          description: string
          type: string
          fileurl: string
          filesize: string
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          title?: string
          description?: string
          type?: string
          fileurl?: string
          filesize?: string
          created_at?: string
        }
      }
      multimedia: {
        Row: {
          id: string
          book_id: string
          title: string
          description: string
          type: string
          url: string
          thumbnail: string
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          title: string
          description: string
          type: string
          url: string
          thumbnail: string
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          title?: string
          description?: string
          type?: string
          url?: string
          thumbnail?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}