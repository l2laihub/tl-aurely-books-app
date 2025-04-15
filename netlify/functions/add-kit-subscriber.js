// Netlify function to add a subscriber to a kindness kit
// This bypasses RLS by using a service role key

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client with service role key (higher privileges)
// These environment variables need to be set in Netlify
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight call successful' }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Debug environment variables
    console.log('Environment variables:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
      supabaseServiceKey: supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    });

    // Parse request body
    const { email, name, kitId } = JSON.parse(event.body);

    console.log('Adding kit subscriber:', { email, name, kitId });

    // Validate required fields
    if (!email || !kitId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and kitId are required' }),
      };
    }

    // Validate Supabase credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing Supabase credentials',
          details: {
            supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
            supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Not set'
          }
        }),
      };
    }

    // Initialize Supabase client
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create new subscriber
    const newSubscriber = {
      id: uuidv4(),
      kit_id: kitId,
      email,
      name: name || undefined,
      created_at: new Date().toISOString()
    };

    // Insert subscriber into database
    const { data, error } = await supabase
      .from('kit_subscribers')
      .insert(newSubscriber)
      .select()
      .single();

    if (error) {
      console.error('Error adding kit subscriber:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to add subscriber: ${error.message}` }),
      };
    }

    console.log('Successfully added kit subscriber:', data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Subscriber added successfully',
        subscriberId: data.id 
      }),
    };
  } catch (error) {
    console.error('Exception in add-kit-subscriber function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Server error: ${error.message}` }),
    };
  }
};