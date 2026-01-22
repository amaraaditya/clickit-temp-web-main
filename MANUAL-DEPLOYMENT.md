# Manual Deployment Guide (AWS Console UI)

This guide walks you through deploying to S3 and CloudFront using the AWS Console UI.

## Prerequisites

1. **Build the project first:**
   ```bash
   npm run build
   ```
   This creates the `dist/` folder with optimized files.

2. **AWS Console Access:**
   - Log in to https://console.aws.amazon.com
   - Navigate to S3 and CloudFront services

## Step 1: Upload Files to S3 Bucket

### Option A: Upload via AWS Console (Recommended for Manual)

1. **Open S3 Console:**
   - Go to https://console.aws.amazon.com/s3
   - Click on your bucket name

2. **Upload Files:**
   - Click **"Upload"** button
   - Click **"Add files"** or drag and drop
   - Navigate to your `dist/` folder and select all files:
     - All HTML files (index.html, about.html, contact.html, etc.)
     - `css/bundle.css`
     - `js/bundle.js`
     - `images/` folder (all images)
     - `config/` folder (constants.js)

3. **Set Cache Headers (Important!):**
   
   **📖 See detailed instructions in `S3-CACHE-HEADERS-GUIDE.md`**
   
   **Quick Steps:**
   
   **For HTML files:**
   - Select all `.html` files
   - In the right panel, find **"Properties"** → **"Metadata"**
   - Click **"Add metadata"** or **"Edit metadata"**
   - **Type:** Select **"System defined"**
   - **Key:** Select **"Cache-Control"** from dropdown
   - **Value:** Enter `no-cache, no-store, must-revalidate`
   - Click **"Save"** or **"Add"**

   **For CSS and JS files:**
   - Select `bundle.css` and `bundle.js`
   - **Properties** → **Metadata** → **Add metadata**
   - **Type:** System defined
   - **Key:** Cache-Control
   - **Value:** `public, max-age=31536000, immutable`
   - Save

   **For Images:**
   - Select all image files
   - **Properties** → **Metadata** → **Add metadata**
   - **Type:** System defined
   - **Key:** Cache-Control
   - **Value:** `public, max-age=86400`
   - Save

   **💡 Tip:** If you can't find metadata during upload, you can set it after upload by:
   1. Click on the file
   2. Go to **"Properties"** tab
   3. Scroll to **"Metadata"** section
   4. Click **"Edit"** → **"Add metadata"**

4. **Upload:**
   - Click **"Upload"** button at bottom
   - Wait for upload to complete

### Option B: Upload Folder Structure

If you want to maintain folder structure:

1. **Upload Folders:**
   - Click **"Upload"** → **"Add folder"**
   - Select the entire `dist/` folder
   - This will upload everything maintaining the structure

2. **Set Cache Headers by Folder:**
   - After upload, select files by type
   - Apply cache headers as described above

## Step 2: Set S3 Bucket Permissions

Since you're using CloudFront, you need to allow CloudFront to read files:

1. **Go to Bucket Permissions:**
   - In your S3 bucket, click **"Permissions"** tab
   - Scroll to **"Bucket policy"**

2. **Add Bucket Policy:**
   Click **"Edit"** and paste this policy (replace `YOUR-BUCKET-NAME`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontAccess",
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR-OAI-ID"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

   **OR** if you're using CloudFront with public access (simpler):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

3. **Block Public Access Settings:**
   - If using public access, go to **"Block public access"** settings
   - Click **"Edit"**
   - Uncheck **"Block all public access"** (if using public bucket policy)
   - Click **"Save changes"**
   - Confirm by typing `confirm`

## Step 3: Configure CloudFront Distribution

1. **Open CloudFront Console:**
   - Go to https://console.aws.amazon.com/cloudfront
   - Click on your distribution ID

2. **Check Origin Settings:**
   - Go to **"Origins"** tab
   - Verify origin domain points to your S3 bucket
   - Origin path should be empty (unless using subfolder)

3. **Update Default Cache Behavior (Important):**
   - Go to **"Behaviors"** tab
   - Click on the default behavior (usually `*`)
   - Click **"Edit"**
   
   **Cache Settings:**
   - **Viewer Protocol Policy:** Redirect HTTP to HTTPS
   - **Allowed HTTP Methods:** GET, HEAD, OPTIONS
   - **Cache Policy:** Choose or create:
     - For HTML: `Managed-CachingDisabled` or custom with `no-cache`
     - For CSS/JS: `Managed-CachingOptimized` or custom with `max-age=31536000`
   
   **OR** use **"Legacy cache settings":**
   - **Object Caching:** Customize
   - **Minimum TTL:** 0 (for HTML), 31536000 (for CSS/JS)
   - **Maximum TTL:** 31536000
   - **Default TTL:** 86400

4. **Add Cache Behaviors (Optional but Recommended):**
   
   Create separate behaviors for different file types:
   
   **For CSS/JS:**
   - Click **"Create behavior"**
   - **Path pattern:** `css/*` or `js/*`
   - **Origin:** Your S3 bucket
   - **Cache policy:** `Managed-CachingOptimized`
   - **TTL:** 31536000 (1 year)
   
   **For Images:**
   - Click **"Create behavior"**
   - **Path pattern:** `images/*`
   - **Origin:** Your S3 bucket
   - **Cache policy:** Custom with `max-age=86400`

5. **Error Pages (404 Handling):**
   - Go to **"Error pages"** tab
   - Click **"Create custom error response"**
   - **HTTP error code:** 404
   - **Customize error response:** Yes
   - **Response page path:** `/index.html`
   - **HTTP response code:** 200
   - Click **"Create"**

6. **Save Changes:**
   - Click **"Save changes"** on any edited behaviors
   - Note: Distribution updates take 5-15 minutes to deploy

## Step 4: Invalidate CloudFront Cache

After uploading new files, you need to invalidate the CloudFront cache:

1. **Go to Invalidations:**
   - In your CloudFront distribution
   - Click **"Invalidations"** tab
   - Click **"Create invalidation"**

2. **Create Invalidation:**
   - **Object paths:** Enter paths to invalidate:
     ```
     /*
     /index.html
     /about.html
     /contact.html
     /customers.html
     /vendors.html
     /css/bundle.css
     /js/bundle.js
     ```
   - Or simply enter `/*` to invalidate everything
   - Click **"Create invalidation"**

3. **Wait for Completion:**
   - Status will show "In Progress"
   - Usually completes in 1-5 minutes
   - Status changes to "Completed" when done

## Step 5: Verify Deployment

1. **Check CloudFront URL:**
   - In CloudFront console, find your distribution
   - Copy the **"Domain name"** (e.g., `d1234abcd5678.cloudfront.net`)
   - Visit: `https://your-domain.cloudfront.net`

2. **Test Pages:**
   - Visit all pages: index, about, contact, customers, vendors
   - Check browser DevTools → Network tab
   - Verify files are loading from CloudFront
   - Check cache headers are correct

3. **Test Features:**
   - Theme toggle works
   - Navigation works
   - Contact form works (EmailJS)
   - All images load correctly

## Future Updates

When you make changes:

1. **Build:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   - Upload only changed files (or all files)
   - Set cache headers as before

3. **Invalidate CloudFront:**
   - Create new invalidation for changed files
   - Or invalidate `/*` for everything

## Troubleshooting

### Files Not Updating
- **Check invalidation status** - Make sure it's completed
- **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Check S3 files** - Verify new files are actually uploaded

### 404 Errors
- **Check error pages** - Make sure 404 → index.html is configured
- **Check file paths** - Verify paths in HTML match S3 structure
- **Check CloudFront origin** - Verify it points to correct S3 bucket

### CSS/JS Not Loading
- **Check cache headers** - Verify Cache-Control is set correctly
- **Check file paths** - Verify paths in HTML are correct
- **Check CORS** - Usually not needed for CloudFront, but check if issues persist

### Slow Updates
- **CloudFront propagation** - Can take 5-15 minutes
- **Use invalidations** - Always invalidate after updates
- **Check distribution status** - Should be "Deployed"

## Quick Reference

**Upload Files:**
1. S3 Console → Your Bucket → Upload
2. Select files from `dist/` folder
3. Set cache headers
4. Upload

**Invalidate Cache:**
1. CloudFront → Your Distribution → Invalidations
2. Create invalidation → Enter `/*`
3. Wait for completion

**Check Status:**
- CloudFront Distribution Status: Should be "Deployed"
- Invalidation Status: Should be "Completed"
