#!/bin/bash

# Click IT - AWS Deployment Script
# This script deploys the static website to S3 and sets up the Lambda function

set -e

echo "🚀 Starting Click IT deployment to AWS..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

# Configuration
BUCKET_NAME="${BUCKET_NAME:-click-it-website}"
REGION="${AWS_REGION:-us-east-1}"
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-click-it-contact-form}"

echo -e "${BLUE}Configuration:${NC}"
echo "  Bucket Name: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  Lambda Function: $LAMBDA_FUNCTION_NAME"
echo ""

# Step 1: Create S3 bucket (if it doesn't exist)
echo -e "${YELLOW}Step 1: Setting up S3 bucket...${NC}"
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "Creating S3 bucket: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    
    # Enable static website hosting
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public read access
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
    echo -e "${GREEN}✓ S3 bucket created and configured${NC}"
else
    echo -e "${GREEN}✓ S3 bucket already exists${NC}"
fi

# Step 2: Upload static files to S3
echo -e "${YELLOW}Step 2: Uploading static files to S3...${NC}"
aws s3 sync . "s3://$BUCKET_NAME" \
    --exclude "*.git/*" \
    --exclude "*.gitignore" \
    --exclude "node_modules/*" \
    --exclude "lambda/*" \
    --exclude "deploy.sh" \
    --exclude "README-DEPLOY.md" \
    --exclude "*.md" \
    --exclude ".DS_Store" \
    --delete \
    --region "$REGION"
echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Step 3: Deploy Lambda function
echo -e "${YELLOW}Step 3: Deploying Lambda function...${NC}"
cd lambda

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Lambda dependencies..."
    npm install --production
fi

# Create deployment package
echo "Creating deployment package..."
zip -r function.zip . -x "*.git*" "*.md" "*.sh"

# Check if function exists
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$REGION" 2>&1 | grep -q 'ResourceNotFoundException'; then
    echo "Creating Lambda function..."
    aws lambda create-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --runtime nodejs18.x \
        --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
        --handler contact-form-handler.handler \
        --zip-file fileb://function.zip \
        --region "$REGION" \
        --timeout 10 \
        --memory-size 128 \
        --environment Variables="{RECIPIENT_EMAIL=${RECIPIENT_EMAIL:-your-email@example.com},SENDER_EMAIL=${SENDER_EMAIL:-noreply@clickit.com}}"
else
    echo "Updating Lambda function..."
    aws lambda update-function-code \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --zip-file fileb://function.zip \
        --region "$REGION"
fi

cd ..
echo -e "${GREEN}✓ Lambda function deployed${NC}"

# Step 4: Create API Gateway (manual step - provide instructions)
echo ""
echo -e "${YELLOW}Step 4: API Gateway Setup (Manual)${NC}"
echo "You need to create an API Gateway REST API and connect it to your Lambda function."
echo "See README-DEPLOY.md for detailed instructions."
echo ""

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "Next steps:"
echo "1. Set up API Gateway (see README-DEPLOY.md)"
echo "2. Update contact.html with your API Gateway URL"
echo "3. Verify your email in AWS SES"
echo "4. (Optional) Set up CloudFront for better performance"
