# AWS S3 Deployment via Management Console (UI)

Step-by-step guide to deploy Click IT website using AWS Management Console (web interface).

## Cost: ~$0.50/month

- S3 Storage: ~$0.023/GB (first 50GB free)
- S3 Requests: ~$0.0004 per 1,000 requests
- **Total**: Less than $1/month for low traffic

## Prerequisites

1. AWS Account (sign up at https://aws.amazon.com)
2. EmailJS configured in contact.html (already done ✅)

## Step-by-Step Deployment

### Step 1: Create S3 Bucket

1. Go to **AWS Management Console**: https://console.aws.amazon.com
2. Sign in to your AWS account
3. In the search bar at the top, type **"S3"** and click on **S3** service
4. Click **"Create bucket"** button (top right)
5. Fill in the bucket details:

   **Bucket name**: 
   - Enter a unique name (e.g., `click-it-website-xpurt`)
   - Must be globally unique across all AWS accounts
   - Use only lowercase letters, numbers, and hyphens
   - No spaces or special characters

   **AWS Region**: 
   - Choose `us-east-1` (N. Virginia) or your preferred region
   - Note the region - you'll need it for the website URL

6. **Object Ownership**: 
   - Select **"ACLs disabled (recommended)"**

7. **Block Public Access settings**:
   - ⚠️ **IMPORTANT**: Uncheck **"Block all public access"**
   - Check the box that says "I acknowledge that the current settings might result in this bucket and the objects within becoming public"
   - This is needed for static website hosting

8. **Bucket Versioning**: 
   - Leave as **"Disable"** (unless you need versioning)

9. **Default encryption**: 
   - Leave as default (optional)

10. Click **"Create bucket"** at the bottom

### Step 2: Enable Static Website Hosting

1. Click on your newly created bucket name to open it
2. Go to the **"Properties"** tab (at the top)
3. Scroll down to **"Static website hosting"** section
4. Click **"Edit"**
5. Select **"Enable"**
6. **Index document**: Enter `index.html`
7. **Error document**: Enter `index.html`
8. Click **"Save changes"**

### Step 3: Set Bucket Policy (Make it Public)

1. Still in your bucket, go to the **"Permissions"** tab
2. Scroll down to **"Bucket policy"** section
3. Click **"Edit"**
4. Copy and paste this policy (replace `YOUR_BUCKET_NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

5. Click **"Save changes"**

### Step 4: Upload Files

1. Still in your bucket, go to the **"Objects"** tab
2. Click **"Upload"** button
3. Click **"Add files"** or **"Add folder"**
4. Select all your website files:
   - Select: `index.html`, `about.html`, `contact.html`, `customers.html`, `vendors.html`
   - Select: `css/` folder (all CSS files)
   - Select: `js/` folder (all JS files)
   - Select: `images/` folder (all images)
   - Select: `config/` folder (if it exists)
   
   **Do NOT upload**:
   - `lambda/` folder
   - `*.sh` files
   - `*.md` files
   - `package.json`
   - `server.js`
   - `.git/` folder
   - `node_modules/` folder

5. After selecting files, scroll down and click **"Upload"**
6. Wait for upload to complete (you'll see a progress bar)

### Step 5: Get Your Website URL (Temporary - HTTP Only)

1. Go back to **"Properties"** tab
2. Scroll down to **"Static website hosting"** section
3. You'll see a **"Bucket website endpoint"** URL
4. This URL is HTTP only (will show "Not Secure" warning)

It will look like:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

⚠️ **Note**: This URL shows "Not Secure" in browsers. Continue to Step 6 to set up HTTPS.

### Step 6: Set Up CloudFront for HTTPS (Required for Secure Connection)

**Follow the detailed CloudFront setup instructions below** (see "Add HTTPS with CloudFront" section).

After CloudFront is set up, you'll get an HTTPS URL like:
```
https://d1234abcd5678.cloudfront.net
```

Use this HTTPS URL for your live website instead of the S3 HTTP URL.

### Step 7: Test Your Website

1. Open the website URL in your browser
2. Test all pages:
   - Home page
   - About Us
   - Contact Us
   - For Customers
   - For Vendors
3. **Test the contact form**:
   - Fill out and submit
   - Check `hello@xpurt.co.uk` for the email
   - Check EmailJS Dashboard → Logs for delivery status

## Updating Your Website

When you make changes to your website:

1. Go to S3 → Your bucket → **"Objects"** tab
2. Find the file(s) you want to update
3. Select the file(s) and click **"Actions"** → **"Upload"** (or just click the file and click "Upload" to replace)
4. Select the updated file(s) and click **"Upload"**
5. The changes will be live immediately

**Or upload all files again**:
1. Select all files in the bucket
2. Click **"Actions"** → **"Delete"** (to remove old files)
3. Then upload all files again using Step 4 above

## ⚠️ IMPORTANT: Add HTTPS with CloudFront (Required for Secure Connection)

S3 static website hosting only provides HTTP (not secure). To get HTTPS (secure connection), you **must** use CloudFront.

### Step-by-Step CloudFront Setup:

1. **Go to CloudFront**:
   - AWS Console → Search **"CloudFront"**
   - Click **"CloudFront"** service
   - Click **"Create distribution"** button

2. **Origin settings**:
   - **Origin domain**: 
     - Click the dropdown
     - Select your S3 bucket (the one you created)
     - **Important**: Choose the bucket name directly, NOT the one ending in `.s3.amazonaws.com`
     - Example: Select `click-it-website-xpurt` (not `click-it-website-xpurt.s3.amazonaws.com`)
   
   - **Origin path**: Leave empty
   
   - **Name**: Auto-filled (leave as is)

3. **Default cache behavior**:
   - **Viewer protocol policy**: 
     - Select **"Redirect HTTP to HTTPS"** ⚠️ This is important!
   
   - **Allowed HTTP methods**: 
     - Select **"GET, HEAD"** (default is fine)
   
   - **Cache policy**: 
     - Select **"CachingOptimized"** (default)

4. **Settings**:
   - **Price class**: 
     - Select **"Use only North America and Europe"** (cheapest option)
   
   - **Alternate domain names (CNAMEs)**: 
     - Leave empty (unless you have a custom domain)
   
   - **Default root object**: 
     - Enter `index.html` ⚠️ Important!
   
   - **Custom SSL certificate**: 
     - Leave as default (CloudFront provides free SSL)

5. **Click "Create distribution"** at the bottom

6. **Wait for deployment**:
   - Status will show "In Progress"
   - Wait ~15-20 minutes for deployment to complete
   - Status will change to "Deployed" when ready

7. **Get your HTTPS URL**:
   - Once deployed, you'll see a **"Distribution domain name"**
   - It looks like: `d1234abcd5678.cloudfront.net`
   - This URL has HTTPS! ✅
   - Use this URL instead of the S3 website URL

### Cost Impact

CloudFront adds minimal cost:
- **Free tier**: 1TB data transfer out, 10M requests/month
- **After free tier**: ~$0.085 per GB (very cheap for small sites)
- **Total with CloudFront**: Still ~$0-2/month for low traffic

### Update Your Website URL

After CloudFront is deployed:
- **Old URL** (HTTP, not secure): `http://bucket-name.s3-website-us-east-1.amazonaws.com`
- **New URL** (HTTPS, secure): `https://d1234abcd5678.cloudfront.net` ✅

Use the CloudFront URL for your live website!

## Troubleshooting

### Bucket name already exists
- Choose a different unique name
- Try adding your company name or random numbers
- Bucket names are globally unique across all AWS

### "Block all public access" error
- Make sure you unchecked "Block all public access" when creating the bucket
- Go to Permissions → Block public access → Edit → Uncheck all boxes → Save

### Website shows "Access Denied"
- Check bucket policy is set correctly (Step 3)
- Verify static website hosting is enabled (Step 2)
- Make sure you're using the "Bucket website endpoint" URL, not the regular S3 URL

### Files not uploading
- Check file sizes (S3 has limits)
- Make sure you have proper permissions
- Try uploading files one by one to identify problematic files

### Contact form not working
- Verify EmailJS is configured in contact.html
- Check browser console (F12) for JavaScript errors
- Check EmailJS Dashboard → Logs for delivery status
- Make sure all JS files uploaded correctly

## Cost Monitoring

1. Go to AWS Console → Search **"Billing"**
2. Click **"Cost Explorer"**
3. View your S3 costs
4. Set up billing alerts if needed:
   - Go to **"Billing"** → **"Budgets"**
   - Create a budget to get alerts if costs exceed a threshold

## Important Notes

- **Bucket names are permanent** - you can't rename a bucket, only create a new one
- **S3 Website URL** (HTTP only): `http://bucket-name.s3-website-region.amazonaws.com`
  - ⚠️ Shows "Not Secure" warning in browsers
  - Use only for testing
- **CloudFront URL** (HTTPS): `https://d1234abcd5678.cloudfront.net`
  - ✅ Secure connection, no warnings
  - **Use this for production!**
- **Regular S3 URL won't work** - must use either S3 website endpoint or CloudFront
- **HTTPS requires CloudFront** - S3 static hosting only provides HTTP

That's it! Your website is now live on AWS! 🚀
