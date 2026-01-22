#!/bin/bash

# AWS S3 Deployment Script
# Usage: ./deploy.sh [bucket-name] [region]

set -e

BUCKET_NAME=${1:-"click-it-website"}
REGION=${2:-"us-east-1"}
DIST_DIR="./dist"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to AWS S3...${NC}\n"

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build directory not found. Running build...${NC}\n"
    node build.js
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}❌ AWS CLI not found. Please install it first.${NC}"
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if bucket exists, create if not
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${GREEN}✅ Bucket exists: $BUCKET_NAME${NC}"
else
    echo -e "${YELLOW}📦 Creating bucket: $BUCKET_NAME${NC}"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    
    # Enable static website hosting
    echo -e "${YELLOW}🌐 Enabling static website hosting...${NC}"
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
fi

# Upload files with proper cache headers
echo -e "\n${BLUE}📤 Uploading files to S3...${NC}"

# HTML files - no cache
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html" \
    --delete

# CSS and JS - long cache
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
    --exclude "*" \
    --include "*.css" \
    --include "*.js" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Images - medium cache
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
    --exclude "*" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.png" \
    --include "*.gif" \
    --include "*.svg" \
    --include "*.webp" \
    --cache-control "public, max-age=86400" \
    --delete

# Config files - short cache
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
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

# Set bucket policy for public read access
echo -e "\n${BLUE}🔓 Setting bucket policy for public access...${NC}"
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

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json

# Get website URL
WEBSITE_URL=$(aws s3api get-bucket-website --bucket "$BUCKET_NAME" --query 'WebsiteConfiguration.IndexDocument.Suffix' --output text 2>/dev/null || echo "index.html")
REGION_ENDPOINT=$(aws s3api get-bucket-location --bucket "$BUCKET_NAME" --query 'LocationConstraint' --output text 2>/dev/null || echo "us-east-1")

if [ "$REGION_ENDPOINT" = "None" ] || [ -z "$REGION_ENDPOINT" ]; then
    REGION_ENDPOINT="us-east-1"
fi

echo -e "\n${GREEN}✨ Deployment complete!${NC}\n"
echo -e "${BLUE}🌐 Website URL:${NC}"
echo -e "   http://$BUCKET_NAME.s3-website-$REGION_ENDPOINT.amazonaws.com"
echo -e "\n${YELLOW}💡 Next steps:${NC}"
echo -e "   1. Set up CloudFront for HTTPS and better performance"
echo -e "   2. Configure custom domain (optional)"
echo -e "   3. Enable CloudFront compression for faster loading"
