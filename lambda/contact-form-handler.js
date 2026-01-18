/**
 * AWS Lambda function to handle contact form submissions
 * Sends email via AWS SES
 */

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' });

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

        // Get recipient email from environment variable or use default
        const recipientEmail = process.env.RECIPIENT_EMAIL || 'your-email@example.com';
        const senderEmail = process.env.SENDER_EMAIL || 'noreply@clickit.com';

        // Create email content
        const emailSubject = `Contact Form: ${subject} - Click IT`;
        const emailBody = `
New contact form submission from Click IT website:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the Click IT contact form.
        `.trim();

        const htmlBody = `
            <html>
                <body>
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">This email was sent from the Click IT contact form.</p>
                </body>
            </html>
        `;

        // Send email via SES
        const params = {
            Source: senderEmail,
            Destination: {
                ToAddresses: [recipientEmail]
            },
            Message: {
                Subject: {
                    Data: emailSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    },
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [email] // Allow replying directly to the sender
        };

        await ses.sendEmail(params).promise();

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
