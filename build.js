/**
 * Build Script for AWS S3 Deployment
 * Optimizes assets, bundles CSS/JS, and prepares files for production
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, 'dist');
const SRC_DIR = __dirname;

// Ensure build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Files and directories to copy
const COPY_PATTERNS = [
  { src: 'index.html', dest: 'index.html' },
  { src: 'about.html', dest: 'about.html' },
  { src: 'contact.html', dest: 'contact.html' },
  { src: 'customers.html', dest: 'customers.html' },
  { src: 'vendors.html', dest: 'vendors.html' },
  { src: 'images', dest: 'images', isDir: true },
  { src: 'config', dest: 'config', isDir: true },
];

// CSS files to bundle (in order)
const CSS_FILES = [
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/theme.css',
  'css/homepage.css',
  'css/premium-design.css',
  'css/how-it-works.css',
  'css/vendor-onboarding.css',
  'css/coming-soon.css',
];

// JS files to bundle (in order)
const JS_FILES = [
  'config/constants.js',
  'js/theme.js',
  'js/components.js',
  'js/main.js',
];

/**
 * Minify CSS (basic - removes comments and extra whitespace)
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
    .replace(/;\s*/g, ';') // Remove spaces after semicolons
    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
    .trim();
}

/**
 * Minify JS (basic - removes comments and extra whitespace)
 */
function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
    .trim();
}

/**
 * Bundle CSS files
 */
function bundleCSS() {
  console.log('📦 Bundling CSS files...');
  let bundledCSS = '';
  
  CSS_FILES.forEach(file => {
    const filePath = path.join(SRC_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      bundledCSS += `\n/* ${file} */\n${content}\n`;
    } else {
      console.warn(`⚠️  CSS file not found: ${file}`);
    }
  });
  
  const minified = minifyCSS(bundledCSS);
  const outputPath = path.join(BUILD_DIR, 'css', 'bundle.css');
  
  // Ensure css directory exists
  const cssDir = path.dirname(outputPath);
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, minified, 'utf8');
  console.log(`✅ CSS bundled: ${outputPath} (${(minified.length / 1024).toFixed(2)} KB)`);
  
  return 'css/bundle.css';
}

/**
 * Bundle JS files (excluding EmailJS which loads from CDN)
 */
function bundleJS() {
  console.log('📦 Bundling JS files...');
  let bundledJS = '';
  
  JS_FILES.forEach(file => {
    const filePath = path.join(SRC_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      bundledJS += `\n/* ${file} */\n${content}\n`;
    } else {
      console.warn(`⚠️  JS file not found: ${file}`);
    }
  });
  
  const minified = minifyJS(bundledJS);
  const outputPath = path.join(BUILD_DIR, 'js', 'bundle.js');
  
  // Ensure js directory exists
  const jsDir = path.dirname(outputPath);
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, minified, 'utf8');
  console.log(`✅ JS bundled: ${outputPath} (${(minified.length / 1024).toFixed(2)} KB)`);
  
  return 'js/bundle.js';
}

/**
 * Copy file or directory
 */
function copyItem(src, dest) {
  const srcPath = path.join(SRC_DIR, src);
  const destPath = path.join(BUILD_DIR, dest);
  
  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  Source not found: ${src}`);
    return;
  }
  
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    // Copy directory recursively
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    const files = fs.readdirSync(srcPath);
    files.forEach(file => {
      copyItem(path.join(src, file), path.join(dest, file));
    });
  } else {
    // Copy file
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
  }
}

/**
 * Update HTML files to use bundled assets
 */
function updateHTMLFiles(cssBundle, jsBundle) {
  console.log('📝 Updating HTML files...');
  
  const htmlFiles = ['index.html', 'about.html', 'contact.html', 'customers.html', 'vendors.html'];
  
  htmlFiles.forEach(file => {
    const srcPath = path.join(SRC_DIR, file);
    const destPath = path.join(BUILD_DIR, file);
    
    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  HTML file not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Replace CSS imports with bundled CSS
    // Handle both main.css and any other CSS links
    content = content.replace(
      /<link\s+rel="stylesheet"\s+href="[^"]*\.css">/g,
      `<link rel="stylesheet" href="./${cssBundle}">`
    );
    
    // Replace individual JS files with bundled JS
    // First, replace all individual script tags
    const jsPattern = /<script\s+src="\.\/(config\/constants\.js|js\/theme\.js|js\/components\.js|js\/main\.js)"><\/script>\s*/g;
    content = content.replace(jsPattern, '');
    
    // Find the scripts comment and add bundled JS right after it
    const commentMatch = content.match(/(<!-- Scripts[^>]*>)/);
    if (commentMatch) {
      const commentIndex = content.indexOf(commentMatch[0]);
      const afterComment = content.indexOf('\n', commentIndex) + 1;
      content = content.slice(0, afterComment) + 
                `    <script src="./${jsBundle}"></script>\n` + 
                content.slice(afterComment);
    } else {
      // No comment found, add before closing body tag
      content = content.replace(
        '</body>',
        `    <script src="./${jsBundle}"></script>\n</body>`
      );
    }
    
    // Handle EmailJS if present - remove defer attribute if it exists
    // The inline script now waits for EmailJS to load, but we keep it without defer for faster initialization
    if (content.includes('emailjs/browser')) {
      // Remove defer attribute if present (the inline script handles waiting for EmailJS)
      content = content.replace(
        /<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/@emailjs\/browser@3\/dist\/email\.min\.js"(\s+defer)?[^>]*><\/script>/,
        '<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>'
      );
    }
    
    // Add preconnect for EmailJS CDN
    if (!content.includes('dns-prefetch')) {
      content = content.replace(
        '</head>',
        '    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">\n    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\n</head>'
      );
    }
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
  });
}

/**
 * Main build function
 */
function build() {
  console.log('🚀 Starting build process...\n');
  
  // Clean build directory
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true });
  }
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  
  // Bundle CSS and JS
  const cssBundle = bundleCSS();
  const jsBundle = bundleJS();
  
  // Copy static files
  console.log('\n📋 Copying static files...');
  COPY_PATTERNS.forEach(({ src, dest, isDir }) => {
    copyItem(src, dest);
    console.log(`✅ Copied: ${src} → ${dest}`);
  });
  
  // Update HTML files
  console.log('\n');
  updateHTMLFiles(cssBundle, jsBundle);
  
  console.log('\n✨ Build complete!');
  console.log(`📁 Output directory: ${BUILD_DIR}`);
  console.log('\n📤 Ready for S3 deployment!');
  console.log('   Run: aws s3 sync dist/ s3://your-bucket-name --delete');
}

// Run build
build();
