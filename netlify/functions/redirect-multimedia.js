// netlify/functions/redirect-multimedia.js
const { createClient } = require('@supabase/supabase-js');

// Ensure environment variables are loaded
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key environment variables are not set.');
  return {
    statusCode: 500,
    body: 'Server configuration error.',
  };
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters;

  console.log(`[redirect-multimedia] Received ID: ${id}`);
  console.log(`[redirect-multimedia] Using Supabase URL: ${SUPABASE_URL}`);
  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing book ID for multimedia redirect.',
    };
  }

  try {
    // Fetch only the slug and id for efficiency
    const { data: book, error } = await supabase
      .from('books') // Assuming multimedia is linked to the main 'books' table
      .select('id, slug')
      .eq('id', id) // Query by ID again
      .single();
    console.log(`[redirect-multimedia] Supabase query result for ID ${id}:`, { data: book, error }); // Log based on ID

    if (error || !book || !book.slug) {
      console.error(`Error fetching book or slug missing for multimedia redirect ID ${id}:`, error);
      return {
        statusCode: 404,
        body: `Book with ID ${id} not found or missing slug for multimedia redirect.`,
      };
    }

    // Construct the new URL for the multimedia page
    const shortId = book.id.substring(0, 8);
    const newUrl = `/multimedia/${book.slug}-${shortId}`; // Target multimedia URL

    // Return a 301 Permanent Redirect
    return {
      statusCode: 301,
      headers: {
        Location: newUrl,
      },
      body: `Redirecting to ${newUrl}`,
    };

  } catch (err) {
    console.error(`Unexpected error processing multimedia redirect for ID ${id}:`, err);
    return {
      statusCode: 500,
      body: 'An internal error occurred during multimedia redirect.',
    };
  }
};