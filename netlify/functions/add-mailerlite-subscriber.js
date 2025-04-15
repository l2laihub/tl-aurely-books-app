// Netlify function to add subscribers to MailerLite
// This function is called when a user signs up for a kindness kit

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const { email, name, groupId } = JSON.parse(event.body);

    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Get the MailerLite API key from environment variables
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.error('MAILERLITE_API_KEY environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    // Prepare the subscriber data
    const subscriberData = {
      email,
      fields: {
        name: name || '',
        signup_source: 'Kindness Kit',
      },
      groups: groupId ? [groupId] : [],
      status: 'active',
    };

    // Make the API request to MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(subscriberData),
    });

    const responseData = await response.json();

    // Check if the request was successful
    if (!response.ok) {
      console.error('Error from MailerLite API:', responseData);
      
      // If the subscriber already exists, try to update them instead
      if (response.status === 422 && responseData.message && responseData.message.includes('already exists')) {
        // Update existing subscriber
        const updateResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${email}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            fields: subscriberData.fields,
            groups: subscriberData.groups,
            status: subscriberData.status,
          }),
        });

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
          console.error('Error updating existing subscriber:', updateData);
          return {
            statusCode: updateResponse.status,
            body: JSON.stringify({ error: 'Failed to update subscriber', details: updateData }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Subscriber updated successfully', data: updateData }),
        };
      }

      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to add subscriber to MailerLite', details: responseData }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscriber added successfully', data: responseData }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};