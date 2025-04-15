import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import MailerLite from '@mailerlite/mailerlite-nodejs';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const PARENT_NEWSLETTER_GROUP_ID = '151761231935439936'; // From user input

if (!MAILERLITE_API_KEY) {
  throw new Error("MailerLite API key is not configured in environment variables.");
}

const mailerlite = new MailerLite({ api_key: MAILERLITE_API_KEY });

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: { 'Allow': 'POST' }
    };
  }

  let email: string;
  try {
    const body = JSON.parse(event.body || '{}');
    email = body.email;

    if (!email || typeof email !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email is required in the request body." }),
      };
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid email format." }),
      };
    }

  } catch (error) {
    console.error("Error parsing request body:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body." }),
    };
  }

  try {
    console.log(`Attempting to subscribe ${email} to group ${PARENT_NEWSLETTER_GROUP_ID}`);

    const params = {
      email: email,
      groups: [PARENT_NEWSLETTER_GROUP_ID],
      status: "active", // Or "unconfirmed" if double opt-in is enabled
      // You can add more fields like name, etc. if needed
      // fields: { name: 'Subscriber Name' }
    };

    // Use the SDK to add the subscriber to the group
    // Note: MailerLite API might treat adding an existing subscriber to a group differently.
    // Check MailerLite documentation for specifics (e.g., using update subscriber endpoint if needed).
    // This example assumes adding a new subscriber or adding an existing one to a new group.
    const response = await mailerlite.subscribers.createOrUpdate(params);

    console.log("MailerLite API Response:", response.data); // Log the response for debugging

    // Check if the subscriber data is present and has an ID
    if (response?.data?.data?.id) {
        console.log(`Successfully subscribed ${email} (ID: ${response.data.data.id})`);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Successfully subscribed!" }),
        };
    } else {
        // Handle cases where the API might return 2xx but didn't actually subscribe
        // or if the response structure is unexpected.
        console.error("MailerLite subscription might have failed. Unexpected response:", response.data);
        return {
            statusCode: 500, // Or appropriate error code based on MailerLite response
            body: JSON.stringify({ message: "Subscription failed. Unexpected response from MailerLite." }),
        };
    }

  } catch (error: any) {
    console.error("MailerLite API Error:", error.response?.data || error.message);
    // Provide a more specific error message if possible
    const errorMessage = error.response?.data?.message || "An error occurred during subscription.";
    const statusCode = error.response?.status || 500;

    return {
      statusCode: statusCode,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
};

export { handler };