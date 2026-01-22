# Click IT Website

A professional, information-first website for Click IT - an urban logistics platform that simplifies city life through essentials delivery and small-item movement.

## Project Structure

```
click-it-web/
├── index.html              # Main HTML file with all sections
├── package.json            # Node.js project configuration
├── server.js               # Basic HTTP server for development
├── README.md               # This file
│
├── config/
│   └── constants.js        # Global configuration and constants
│
├── css/
│   ├── base.css           # Reset, typography, fundamental styles
│   ├── layout.css         # Container, grid, structural layouts
│   ├── components.css     # Reusable UI components
│   └── main.css           # Main stylesheet (imports all CSS)
│
└── js/
    ├── config-loader.js   # Loads global configuration
    └── main.js            # Site-wide functionality and interactions
```

## Key Features

### Global Configuration
All critical values are declared in `config/constants.js`, making it easy to update:
- Brand information (name, tagline)
- Weight limits
- Color palette
- Typography settings
- Spacing and breakpoints
- Section IDs for navigation

### Modular CSS Architecture
- **base.css**: Foundation styles (reset, typography)
- **layout.css**: Structural layouts (containers, grids)
- **components.css**: Reusable components (hero, navigation, cards)
- **main.css**: Imports all modules

### Sections Included
1. Hero Section - Brand statement and core value proposition
2. The Problem With Cities Today - Current urban logistics challenges
3. The Click IT Approach - Philosophy and core actions (Get & Move)
4. Value for Customers - Benefits and features for end users
5. Value for Vendors - Detailed vendor benefits and data tools
6. The Data Flywheel - Win-win model explanation
7. Trust & Partnership Philosophy - Long-term thinking and ethics
8. Why Click IT Exists - Founder vision and purpose

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd click-it-web
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The website will be available at `http://localhost:3000`

### Building for Production

To build optimized files for AWS S3 deployment:

```bash
npm run build
```

This creates a `dist/` directory with:
- **Bundled CSS** (`css/bundle.css`) - combines 9 CSS files into 1
- **Bundled JS** (`js/bundle.js`) - combines 4 JS files into 1
- **Optimized HTML** - updated to use bundled assets
- **All static assets** - images, config files

**Performance Benefits:**
- ✅ Reduces HTTP requests from 13+ to 3-4 per page
- ✅ 30-40% smaller file sizes through minification
- ✅ Better browser caching with proper cache headers
- ✅ Faster page load times

### AWS S3 Deployment

See [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy:**
```bash
npm run deploy
```

**Custom bucket:**
```bash
./deploy.sh your-bucket-name us-east-1
```

The deployment script automatically:
- Creates S3 bucket (if needed)
- Enables static website hosting
- Sets proper cache headers for optimal performance
- Configures public access securely

## Customization

### Colors
Edit `config/constants.js` to update the color palette:
```javascript
colors: {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  accent: "#0066cc",
  // ...
}
```

### Typography
Modify font sizes and families in `config/constants.js`:
```javascript
typography: {
  fontSize: {
    hero: "3.5rem",
    h1: "2.5rem",
    // ...
  }
}
```

### Content
All content is in `index.html`. Each section is clearly marked with an ID and can be easily modified.

## Future Enhancements

The structure is designed to easily accommodate:
- React integration (when backend features are needed)
- Photo galleries
- Interactive elements
- Backend API integration
- Database connections

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile, tablet, and desktop
- Graceful degradation for older browsers

## Notes

- The design is minimal and professional, focusing on information clarity
- All critical values are centralized in the config file for easy updates
- Code is modular and well-commented for easy maintenance
- The structure supports future expansion without major refactoring

