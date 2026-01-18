# Click IT - AWS Deployment Guide

This guide will help you deploy the Click IT website to AWS with email functionality at minimal cost.

## Estimated Monthly Cost

- **S3 Storage**: ~$0.023/GB (first 50GB free)
- **S3 Requests**: ~$0.0004 per 1,000 requests
- **Lambda**: Free tier includes 1M requests/month, then $0.20 per 1M requests
- **API Gateway**: Free tier includes 1M requests/month, then $3.50 per 1M requests
- **SES**: $0.10 per 1,000 emails (first 62,000 emails free if sent from EC2)

**Total for low traffic**: ~$0-5/month

## Prerequisites

1. AWS Account (sign up at https://aws.amazon.com)
2. AWS CLI installed and configured
3. Node.js installed (for Lambda deployment)

## Step-by-Step Deployment

### 1. Install and Configure AWS CLI

```bash
# Install AWS CLI (if not installed)
# macOS:
brew install awscli

# Linux:
sudo apt-get install awscli

# Configure AWS CLI with your credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
# Enter default output format (json)
```

### 2. Set Up AWS SES (Simple Email Service)

#### 2.1 Verify Your Email Address

1. Go to AWS Console → SES → Verified identities
2. Click "Create identity"
3. Select "Email address"
4. Enter your email (where you want to receive contact form submissions)
5. Click "Create identity"
6. Check your email and click the verification link

#### 2.2 Verify Sender Email (Optional but Recommended)

1. Verify another email address to use as the sender (e.g., noreply@yourdomain.com)
2. Or use your verified email as both sender and recipient

#### 2.3 Move Out of SES Sandbox (Important!)

By default, SES is in sandbox mode and can only send to verified emails.

**To move out of sandbox:**
1. Go to SES → Account dashboard
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for approval (usually 24-48 hours)

**OR** keep it in sandbox and only send to verified emails (works for testing).

### 3. Create IAM Role for Lambda

1. Go to AWS Console → IAM → Roles
2. Click "Create role"
3. Select "AWS service" → "Lambda"
4. Click "Next"
5. Attach policies:
   - `AWSLambdaBasicExecutionRole`
   - Create custom policy for SES (see below)
6. Name it: `lambda-execution-role`
7. Click "Create role"

**Custom SES Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```

### 4. Deploy the Website

#### 4.1 Set Environment Variables

```bash
export BUCKET_NAME="click-it-website"
export AWS_REGION="us-east-1"
export RECIPIENT_EMAIL="your-email@example.com"  # Your verified email
export SENDER_EMAIL="noreply@clickit.com"  # Your verified sender email
export LAMBDA_FUNCTION_NAME="click-it-contact-form"
```

#### 4.2 Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
- Create S3 bucket
- Upload static files
- Deploy Lambda function

### 5. Set Up API Gateway

#### 5.1 Create REST API

1. Go to AWS Console → API Gateway
2. Click "Create API"
3. Select "REST API" → "Build"
4. Choose "New API"
5. Name: `click-it-api`
6. Click "Create API"

#### 5.2 Create Resource and Method

1. Click "Actions" → "Create Resource"
2. Resource name: `contact`
3. Click "Create Resource"
4. Select the `/contact` resource
5. Click "Actions" → "Create Method"
6. Select "POST"
7. Click the checkmark
8. Integration type: "Lambda Function"
9. Check "Use Lambda Proxy integration"
10. Lambda Function: `click-it-contact-form`
11. Click "Save" → "OK" (when prompted to add permissions)

#### 5.3 Enable CORS

1. Select the `/contact` resource
2. Click "Actions" → "Enable CORS"
3. Leave defaults and click "Enable CORS and replace existing CORS headers"
4. Click "Yes, replace existing values"

#### 5.4 Deploy API

1. Click "Actions" → "Deploy API"
2. Deployment stage: `prod` (or create new)
3. Click "Deploy"
4. **Copy the Invoke URL** (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

### 6. Update Contact Form

Update `contact.html` with your API Gateway URL:

```javascript
// Replace this in contact.html
const API_URL = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/contact';
```

### 7. Update Lambda Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name click-it-contact-form \
  --environment Variables="{RECIPIENT_EMAIL=your-email@example.com,SENDER_EMAIL=noreply@clickit.com}" \
  --region us-east-1
```

### 8. Re-upload Updated Files

```bash
aws s3 sync . s3://click-it-website \
  --exclude "*.git/*" \
  --exclude "lambda/*" \
  --exclude "node_modules/*" \
  --exclude "*.sh" \
  --exclude "*.md" \
  --delete
```

## Testing

1. Visit your website: `http://click-it-website.s3-website-us-east-1.amazonaws.com`
2. Fill out the contact form
3. Check your email inbox

## Optional: Set Up CloudFront (CDN)

For better performance and HTTPS:

1. Go to CloudFront → Create distribution
2. Origin domain: Select your S3 bucket
3. Viewer protocol policy: Redirect HTTP to HTTPS
4. Default root object: `index.html`
5. Create distribution
6. Wait for deployment (~15 minutes)
7. Use CloudFront URL instead of S3 URL

## Optional: Custom Domain

1. Get a domain (e.g., from Route 53 or external registrar)
2. Create SSL certificate in AWS Certificate Manager
3. Update CloudFront distribution with custom domain
4. Point DNS to CloudFront distribution

## Troubleshooting

### Lambda function not working
- Check CloudWatch Logs for errors
- Verify IAM role has SES permissions
- Check environment variables are set correctly

### Emails not sending
- Verify email addresses in SES
- Check if SES is in sandbox mode
- Review CloudWatch Logs for SES errors

### CORS errors
- Ensure CORS is enabled in API Gateway
- Check API Gateway CORS configuration
- Verify Lambda returns CORS headers

## Cost Optimization Tips

1. **Use S3 static hosting** instead of EC2 (much cheaper)
2. **Use Lambda** instead of always-on servers (pay per request)
3. **Stay in SES sandbox** for testing (free, but limited)
4. **Use CloudFront** only if you need HTTPS or better performance
5. **Monitor usage** with AWS Cost Explorer

## Support

For issues or questions:
- Check AWS documentation
- Review CloudWatch Logs
- Check SES sending statistics
