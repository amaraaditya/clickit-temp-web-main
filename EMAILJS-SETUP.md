# EmailJS Setup Guide - Step by Step

## Quick Answer

**Create a NEW custom template** - Don't use the prefixed templates like "Contact US" or "OTP". Those are just examples.

## Detailed Setup

### Step 1: Sign Up for EmailJS

1. Go to https://www.emailjs.com
2. Click "Sign Up" (free account)
3. Verify your email address

### Step 2: Add Email Service

1. Go to Dashboard → **Email Services**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (easiest - just connect your Gmail account)
   - **Outlook** (connect your Outlook account)
   - **Custom SMTP** (for other email providers)
4. Follow the connection steps
5. **Copy the Service ID** (looks like `service_abc123`)

### Step 3: Create Custom Email Template

**Important**: Create a NEW template, don't use the prefixed ones!

1. Go to Dashboard → **Email Templates**
2. Click **"Create New Template"** (the big button, not the prefixed examples)
3. Fill in the template:

   **Template Name**: `click-it-contact-form`
   
   **To Email**: `hello@xpurt.co.uk` (where you want to receive messages)
   
   **From Name**: `{{name}}` (this will be the sender's name)
   
   **From Email**: `{{email}}` (this will be the sender's email)
   
   **Subject**: `Contact Form: {{subject}} - Click IT`
   
   **Content** (the message body):
   ```
   New contact form submission from Click IT website:
   
   Name: {{name}}
   Email: {{email}}
   Subject: {{subject}}
   
   Message:
   {{message}}
   
   ---
   This email was sent from the Click IT contact form.
   ```

4. Click **"Save"**
5. **Copy the Template ID** (looks like `template_xyz789`)

### Step 4: Get Your Public Key

1. Go to Dashboard → **Account** → **General**
2. Find **"Public Key"**
3. **Copy the Public Key** (looks like `abcdefghijklmnop`)

### Step 5: Update contact.html

Open `contact.html` and find the script section at the bottom. Replace:

1. `YOUR_PUBLIC_KEY` → Your Public Key
2. `YOUR_SERVICE_ID` → Your Service ID
3. `YOUR_TEMPLATE_ID` → Your Template ID

Example:
```javascript
emailjs.init("abcdefghijklmnop");  // Your Public Key
emailjs.sendForm('service_abc123', 'template_xyz789', form)  // Your Service ID and Template ID
```

### Step 6: Test

1. Open your website
2. Go to Contact page
3. Fill out and submit the form
4. Check your email inbox
5. Check EmailJS Dashboard → **Logs** to see delivery status

## About the Prefixed Templates

The templates you see like "Contact US", "OTP", etc. are **example templates** provided by EmailJS. They're just samples to show you how templates work.

**You should create your own custom template** that matches your form fields:
- `{{name}}` - from your form's name field
- `{{email}}` - from your form's email field
- `{{subject}}` - from your form's subject field
- `{{message}}` - from your form's message field

## Troubleshooting

### Template variables not working?
- Make sure form field `name` attributes match template variables
- Your form uses: `name="name"`, `name="email"`, `name="subject"`, `name="message"`
- Template should use: `{{name}}`, `{{email}}`, `{{subject}}`, `{{message}}`

### Emails not sending?
- Check EmailJS Dashboard → Logs for errors
- Verify your email service is connected
- Make sure all three IDs (Public Key, Service ID, Template ID) are correct in contact.html

### Need help?
- EmailJS Documentation: https://www.emailjs.com/docs
- EmailJS Dashboard: https://dashboard.emailjs.com
