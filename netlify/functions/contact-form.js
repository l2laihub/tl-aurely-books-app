const { Resend } = require('resend');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the form data
    const formData = new URLSearchParams(event.body);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const subject = formData.get('subject') || 'New Contact Form Submission';
    const message = formData.get('message') || '';

    // Initialize Resend with your API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send the email
    // Now using the verified domain tlaurelybooks.com
    const data = await resend.emails.send({
      from: 'contact@tlaurelybooks.com', // Using verified domain
      to: 'tlaurely1149@gmail.com', // Direct to final destination
      reply_to: email, // Set reply-to as the form submitter's email
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="background-color: #f9f9f9; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4a90e2;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully', id: data.id })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending email', error: error.message })
    };
  }
};
