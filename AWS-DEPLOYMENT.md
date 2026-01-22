# AWS S3 Deployment Guide

This guide explains how to deploy the Click IT website to AWS S3 with optimizations for performance and cost efficiency.

## 🚀 Quick Start

### 1. Build the Project

```bash
npm run build
```

This will:
- Bundle all CSS files into `dist/css/bundle.css`
- Bundle all JS files into `dist/js/bundle.js`
- Minify assets for production
- Optimize HTML files to use bundled assets
- Copy all static files to `dist/` directory

### 2. Deploy to S3

```bash
# Deploy to default bucket (click-it-website)
npm run deploy

# Or specify custom bucket and region
./deploy.sh your-bucket-name us-east-1
```

## 📋 Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   aws configure
   ```

2. **AWS Account with S3 access**
   - Create an account at https://aws.amazon.com
   - Set up IAM user with S3 permissions

3. **Node.js** (for build process)
   ```bash
   node --version
   ```

## 🏗️ Build Process

The build script (`build.js`) optimizes the codebase by:

### CSS Optimization
- Bundles 9 CSS files into 1 (`bundle.css`)
- Removes comments and whitespace
- Reduces file size by ~30-40%

### JavaScript Optimization
- Bundles 4 JS files into 1 (`bundle.js`)
- Removes comments and whitespace
- Maintains functionality while reducing HTTP requests

### HTML Optimization
- Updates all HTML files to reference bundled assets
- Adds `defer` attribute to scripts for better loading
- Adds DNS prefetch for EmailJS CDN
- Maintains EmailJS CDN loading (external dependency)

### Asset Organization
- Copies images, config files, and HTML to `dist/`
- Maintains directory structure
- Preserves all functionality

## 📤 Deployment Process

The deployment script (`deploy.sh`) handles:

1. **Bucket Creation** (if needed)
   - Creates S3 bucket
   - Enables static website hosting

2. **File Upload with Cache Headers**
   - **HTML files**: `no-cache` (always fresh)
   - **CSS/JS bundles**: `max-age=31536000` (1 year, immutable)
   - **Images**: `max-age=86400` (1 day)
   - **Config files**: `max-age=3600` (1 hour)

3. **Bucket Policy**
   - Sets public read access for website files
   - Secure and follows AWS best practices

## 🌐 CloudFront Setup (Recommended)

For production, set up CloudFront for:
- HTTPS/SSL certificates
- Better global performance
- Lower latency
- Additional caching layers

### CloudFront Configuration

1. **Create Distribution**
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name your-bucket-name.s3-website-us-east-1.amazonaws.com \
     --default-root-object index.html
   ```

2. **Cache Behaviors**
   - HTML: `no-cache`
   - CSS/JS: `max-age=31536000`
   - Images: `max-age=86400`

3. **Compression**
   - Enable Gzip/Brotli compression
   - Reduces file sizes by 60-80%

## 📊 Performance Optimizations

### Current Optimizations
- ✅ CSS bundling (9 files → 1)
- ✅ JS bundling (4 files → 1)
- ✅ Minification
- ✅ Proper cache headers
- ✅ DNS prefetch for external resources
- ✅ Deferred script loading

### Additional Recommendations

1. **Image Optimization**
   ```bash
   # Use tools like imagemin or squoosh
   npm install -g imagemin-cli
   imagemin images/* --out-dir=dist/images
   ```

2. **CloudFront Compression**
   - Enable automatic compression
   - Saves bandwidth and improves load times

3. **CDN for Static Assets**
   - Consider CloudFront or Cloudflare
   - Reduces latency globally

4. **Service Worker** (Future)
   - Add offline support
   - Cache static assets
   - Improve repeat visit performance

## 🔧 Manual Deployment

If you prefer manual deployment:

```bash
# 1. Build
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://your-bucket-name \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html"

# 3. Upload HTML with no-cache
aws s3 sync dist/ s3://your-bucket-name \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# 4. Enable website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

## 📝 Environment Variables

For different environments, you can modify:

- `config/constants.js` - Update API keys, endpoints
- EmailJS configuration in `contact.html`

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires Node 12+)
- Ensure all source files exist
- Check file permissions

### Deployment Fails
- Verify AWS credentials: `aws sts get-caller-identity`
- Check bucket permissions
- Ensure bucket name is globally unique

### Website Not Loading
- Check bucket policy allows public read
- Verify static website hosting is enabled
- Check CloudFront distribution status (if using)

## 📚 Additional Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [EmailJS Documentation](https://www.emailjs.com/docs)

## 🎯 Cost Optimization

- **S3 Storage**: ~$0.023 per GB/month
- **Data Transfer**: First 1GB free, then $0.09/GB
- **CloudFront**: Pay-as-you-go, typically $0.085/GB
- **Estimated Monthly Cost**: $5-20 for moderate traffic

## ✅ Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test locally with `dist/` folder
- [ ] Verify all pages load correctly
- [ ] Test contact form (EmailJS)
- [ ] Check mobile responsiveness
- [ ] Verify theme toggle works
- [ ] Test in different browsers
- [ ] Set up CloudFront (recommended)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
