# Quick Start - AWS Deployment

## Option 1: Full AWS Setup (Recommended for Production)

Follow the detailed guide in `README-DEPLOY.md`. This gives you full control and is very cost-effective.

**Estimated time**: 30-45 minutes  
**Monthly cost**: $0-5 for low traffic

## Option 2: Quick Setup with EmailJS (Easiest - No AWS Setup)

If you want to get started quickly without AWS setup, you can use EmailJS (free tier: 200 emails/month).

### Steps:

1. **Sign up for EmailJS** (https://www.emailjs.com)
2. **Create an email service** (Gmail, Outlook, etc.)
3. **Get your Service ID, Template ID, and Public Key**
4. **Update contact.html**:

Replace the script section with:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
    (function(){
        emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
    })();

    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
            .then(function() {
                alert('Thank you for your message! We will get back to you soon.');
                document.getElementById('contactForm').reset();
            }, function(error) {
                alert('An error occurred. Please try again later.');
                console.error('EmailJS Error:', error);
            })
            .finally(function() {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
    });
</script>
```

5. **Deploy to any static host** (Netlify, Vercel, GitHub Pages, or AWS S3)

**Pros**: 
- No AWS setup required
- Works immediately
- Free for 200 emails/month

**Cons**: 
- Limited free tier
- Less control over email delivery

## Option 3: AWS S3 Only (No Email Functionality)

If you just want to host the website without email functionality:

```bash
# Create bucket
aws s3 mb s3://click-it-website --region us-east-1

# Enable static hosting
aws s3 website s3://click-it-website --index-document index.html

# Upload files
aws s3 sync . s3://click-it-website --exclude "*.git/*" --exclude "lambda/*" --exclude "node_modules/*"

# Set public access
aws s3api put-bucket-policy --bucket click-it-website --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::click-it-website/*"
  }]
}'
```

Website URL: `http://click-it-website.s3-website-us-east-1.amazonaws.com`

---

## Recommended: Full AWS Setup

For production use, I recommend the full AWS setup (Option 1) because:
- Very low cost ($0-5/month)
- Scalable
- Professional email delivery
- Full control

Follow `README-DEPLOY.md` for step-by-step instructions.
