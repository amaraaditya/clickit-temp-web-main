# CLI Deployment Guide (Alternative to Manual)

If you prefer using AWS CLI instead of the console UI, use these commands.

## Prerequisites

1. **Install AWS CLI:**
   ```bash
   # macOS
   brew install awscli
   
   # Or download from: https://aws.amazon.com/cli/
   ```

2. **Configure AWS CLI:**
   ```bash
   aws configure
   # Enter your Access Key ID
   # Enter your Secret Access Key
   # Enter region (e.g., us-east-1)
   # Enter output format (json)
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Step 1: Upload Files to S3

### Upload with Cache Headers

```bash
# Set your bucket name
BUCKET_NAME="your-bucket-name"

# Upload HTML files with no-cache
aws s3 sync dist/ s3://$BUCKET_NAME \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --delete

# Upload CSS/JS with long cache
aws s3 sync dist/ s3://$BUCKET_NAME \
  --exclude "*" \
  --include "*.css" \
  --include "*.js" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

# Upload images with medium cache
aws s3 sync dist/ s3://$BUCKET_NAME \
  --exclude "*" \
  --include "*.jpg" \
  --include "*.jpeg" \
  --include "*.png" \
  --include "*.gif" \
  --include "*.svg" \
  --include "*.webp" \
  --cache-control "public, max-age=86400" \
  --delete

# Upload config and other files
aws s3 sync dist/ s3://$BUCKET_NAME \
  --exclude "*.html" \
  --exclude "*.css" \
  --exclude "*.js" \
  --exclude "*.jpg" \
  --exclude "*.jpeg" \
  --exclude "*.png" \
  --exclude "*.gif" \
  --exclude "*.svg" \
  --exclude "*.webp" \
  --cache-control "public, max-age=3600" \
  --delete
```

### Or Upload Everything at Once (Simpler)

```bash
BUCKET_NAME="your-bucket-name"

# Upload all files
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Then update cache headers for specific file types
aws s3 cp s3://$BUCKET_NAME/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --metadata-directive REPLACE

# Repeat for other HTML files
aws s3 cp s3://$BUCKET_NAME/css/bundle.css s3://$BUCKET_NAME/css/bundle.css \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE

aws s3 cp s3://$BUCKET_NAME/js/bundle.js s3://$BUCKET_NAME/js/bundle.js \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE
```

## Step 2: Set Bucket Policy

```bash
BUCKET_NAME="your-bucket-name"

# Create bucket policy file
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

# Apply bucket policy
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

# Remove public access block (if needed)
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

## Step 3: Invalidate CloudFront Cache

```bash
# Set your distribution ID
DISTRIBUTION_ID="E1234567890ABC"

# Create invalidation for all files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Or invalidate specific files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/index.html" "/about.html" "/contact.html" "/css/bundle.css" "/js/bundle.js"
```

## Step 4: Check Status

```bash
# Check S3 bucket contents
aws s3 ls s3://$BUCKET_NAME --recursive

# Check CloudFront distribution status
aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'

# Check invalidation status
aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID --max-items 1
```

## One-Command Deployment Script

Create a file `deploy-cloudfront.sh`:

```bash
#!/bin/bash

set -e

BUCKET_NAME=${1:-"your-bucket-name"}
DISTRIBUTION_ID=${2:-"E1234567890ABC"}

echo "🚀 Building..."
npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "🔄 Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 CloudFront URL: https://$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)"
```

Make it executable:
```bash
chmod +x deploy-cloudfront.sh
```

Run it:
```bash
./deploy-cloudfront.sh your-bucket-name E1234567890ABC
```

## Quick Commands Reference

```bash
# Upload everything
aws s3 sync dist/ s3://bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"

# Check what's in S3
aws s3 ls s3://bucket-name --recursive

# Get CloudFront URL
aws cloudfront get-distribution --id DIST_ID --query 'Distribution.DomainName' --output text
```
