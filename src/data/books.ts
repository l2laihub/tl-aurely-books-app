// Sample book data
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  publishDate: string;
  genre: string[];
  isbn: string;
  pages: number;
  ageRange: string;
  slug: string; // Added for URL generation
  downloadMaterials: DownloadMaterial[];
}

export interface DownloadMaterial {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'image' | 'other';
  fileUrl: string;
  fileSize: string;
}

export const books: Book[] = [
  {
    id: '1',
    title: 'The Curious Adventures of Penny the Penguin',
    author: 'T.L. Aurely',
    coverImage: 'https://images.unsplash.com/photo-1596920566172-cb3138ec131f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    description: 'Join Penny the Penguin as she explores the wonders of Antarctic wildlife! This beautifully illustrated book teaches children about polar ecosystems while following Penny\'s quest to find new friends in the icy landscape.',
    publishDate: '2023-05-15',
    genre: ['Educational', 'Adventure', 'Animals'],
    isbn: '978-1234567890',
    pages: 32,
    ageRange: '4-8 years',
    slug: 'the-curious-adventures-of-penny-the-penguin', // Added slug
    downloadMaterials: [
      {
        id: '101',
        title: 'Penguin Facts Activity Sheet',
        description: 'Fun facts and activities about penguins for kids to enjoy',
        type: 'pdf',
        fileUrl: '/downloads/penguin-activity-sheet.pdf',
        fileSize: '1.2 MB'
      },
      {
        id: '102',
        title: 'Antarctic Animal Sounds',
        description: 'Audio collection of real Antarctic animal sounds',
        type: 'audio',
        fileUrl: '/downloads/antarctic-sounds.mp3',
        fileSize: '8.5 MB'
      },
      {
        id: '103',
        title: 'Coloring Pages',
        description: 'Printable coloring pages featuring Penny and friends',
        type: 'pdf',
        fileUrl: '/downloads/penny-coloring-pages.pdf',
        fileSize: '3.3 MB'
      }
    ]
  },
  {
    id: '2',
    title: 'Counting Stars with Professor Owl',
    author: 'T.L. Aurely',
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    description: 'Professor Owl takes young readers on a magical journey through the night sky! Learn to count from 1 to 10 with twinkling stars, planets, and constellations in this bedtime adventure that introduces basic astronomy concepts.',
    publishDate: '2024-01-10',
    genre: ['Educational', 'STEM', 'Bedtime Stories'],
    isbn: '978-0987654321',
    pages: 24,
    ageRange: '3-6 years',
    slug: 'counting-stars-with-professor-owl', // Added slug
    downloadMaterials: [
      {
        id: '201',
        title: 'Night Sky Map for Kids',
        description: 'Simple star chart that children can use to identify constellations',
        type: 'pdf',
        fileUrl: '/downloads/night-sky-map.pdf',
        fileSize: '2.5 MB'
      },
      {
        id: '202',
        title: 'Space Flashcards',
        description: 'Printable flashcards with planets and space vocabulary',
        type: 'pdf',
        fileUrl: '/downloads/space-flashcards.pdf',
        fileSize: '4.7 MB'
      },
      {
        id: '203',
        title: 'Lullaby Soundtrack',
        description: 'Gentle lullabies to accompany bedtime reading',
        type: 'audio',
        fileUrl: '/downloads/owl-lullabies.zip',
        fileSize: '15.2 MB'
      }
    ]
  },
  {
    id: '3',
    title: 'The Magical Garden of Letters',
    author: 'T.L. Aurely',
    coverImage: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    description: 'Explore the enchanted alphabet garden where every letter grows as a magical plant! Join Lily and her fairy friends as they collect all 26 letters to create words and solve puzzles. An imaginative way to learn the alphabet and basic phonics.',
    publishDate: '2022-09-22',
    genre: ['Educational', 'Fantasy', 'Early Learning'],
    isbn: '978-5678901234',
    pages: 40,
    ageRange: '3-7 years',
    slug: 'the-magical-garden-of-letters', // Added slug
    downloadMaterials: [
      {
        id: '301',
        title: 'Alphabet Garden Poster',
        description: 'Colorful poster featuring all letters in their garden form',
        type: 'pdf',
        fileUrl: '/downloads/alphabet-garden-poster.pdf',
        fileSize: '5.7 MB'
      },
      {
        id: '302',
        title: 'Letter Recognition Game',
        description: 'Printable cards for a fun letter matching game',
        type: 'pdf',
        fileUrl: '/downloads/letter-game.pdf',
        fileSize: '3.1 MB'
      },
      {
        id: '303',
        title: 'Alphabet Song',
        description: 'Original song from the book to help remember letters',
        type: 'audio',
        fileUrl: '/downloads/alphabet-song.mp3',
        fileSize: '6.4 MB'
      }
    ]
  }
];

export const getBookById = (id: string): Book | undefined => {
  return books.find(book => book.id === id);
};