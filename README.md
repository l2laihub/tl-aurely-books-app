# Literary Haven - Children's Book Platform

## Storage Setup Instructions

To enable file uploads for the materials in the admin panel, you need to:

1. Log into your Supabase dashboard
2. Go to Storage → Create a new bucket
3. Name the bucket `materials`
4. Set the bucket's public access level as needed (public read is recommended)
5. Add appropriate policies to control who can upload files

Without this bucket, the application will fall back to using file references only, and uploads will not be stored in Supabase storage.

## Project Overview

Literary Haven is a platform for showcasing children's books, along with supplementary educational materials like PDF activity sheets, audio files, and videos. The platform includes both a public-facing website for readers and an admin panel for content management.

## Features

- Public website with:
  - Book listings and details
  - Educational materials for each book
  - Multimedia content (videos and audio)
  - Author information

- Admin panel with:
  - Authentication
  - Book management (add, edit, delete)
  - Materials management
  - Dashboard for activity overview

## Technical Stack

- React with TypeScript
- Tailwind CSS for styling
- Supabase for backend database and authentication
- React Router for navigation
- Lucide React for icons