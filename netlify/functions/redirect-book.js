// netlify/functions/redirect-book.js
const { createClient } = require('@supabase/supabase-js');

// Ensure environment variables are loaded (Netlify handles this in production)
// For local dev (netlify dev), set these in your .env file or Netlify UI
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key environment variables are not set.');
  // Return a generic error in case env vars are missing
  return {
    statusCode: 500,
    body: 'Server configuration error.',
  };
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing book ID.',
    };
  }

  try {
    // Fetch only the slug and id for efficiency
    const { data: book, error } = await supabase
      .from('books') // Ensure this matches your actual table name
      .select('id, slug')
      .eq('id', id)
      .single();

    if (error || !book || !book.slug) {
      // Log the error for debugging
      console.error(`Error fetching book or slug missing for ID ${id}:`, error);
      // If book not found or slug is missing, return 404
      return {
        statusCode: 404,
        body: `Book with ID ${id} not found or missing slug.`,
      };
    }

    // Construct the new URL
    const shortId = book.id.substring(0, 8);
    const newUrl = `/books/${book.slug}-${shortId}`;

    // Return a 301 Permanent Redirect
    return {
      statusCode: 301,
      headers: {
        Location: newUrl,
      },
      // Optional: body content for browsers that don't automatically redirect
      body: `Redirecting to ${newUrl}`,
    };

  } catch (err) {
    console.error(`Unexpected error processing redirect for ID ${id}:`, err);
    return {
      statusCode: 500,
      body: 'An internal error occurred.',
    };
  }
};