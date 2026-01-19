/**
 * AWS Lambda function to handle contact form submissions
 * Uses SendGrid for email delivery
 */

const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body);
        const { name, email, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'All fields are required'
                })
            };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid email address'
                })
            };
        }

        // Initialize SendGrid
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Get recipient and sender from environment variables
        const recipientEmail = process.env.RECIPIENT_EMAIL;
        const senderEmail = process.env.SENDER_EMAIL;

        if (!recipientEmail || !senderEmail) {
            throw new Error('RECIPIENT_EMAIL and SENDER_EMAIL must be set in environment variables');
        }

        // Create email message
        const msg = {
            to: recipientEmail,
            from: senderEmail, // Must be verified in SendGrid
            replyTo: email, // Allow replying directly to the sender
            subject: `Contact Form: ${subject} - Click IT`,
            text: `
New contact form submission from Click IT website:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the Click IT contact form.
            `.trim(),
            html: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #C8102E 0%, #012169 50%, #C8102E 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                            <h2 style="color: #ffffff; margin: 0;">New Contact Form Submission</h2>
                        </div>
                        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
                            <p><strong>Message:</strong></p>
                            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #C8102E;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div style="background: #f8f8f8; padding: 15px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
                            <p style="color: #666; font-size: 12px; margin: 0;">This email was sent from the Click IT contact form.</p>
                        </div>
                    </body>
                </html>
            `
        };

        // Send email via SendGrid
        await sgMail.send(msg);

        // Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Thank you for your message! We will get back to you soon.'
            })
        };

    } catch (error) {
        console.error('Error processing contact form:', error);
        
        // Handle SendGrid specific errors
        if (error.response) {
            console.error('SendGrid Error Details:', error.response.body);
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'An error occurred while sending your message. Please try again later.'
            })
        };
    }
};
