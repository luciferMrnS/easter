# EasterBlog - Modern Vlog Website

A modern, responsive vlog website with a comprehensive backend for managing videos and photos. Built with HTML5, CSS3, JavaScript, and Node.js.

## Features

### Frontend
- 🎥 **Video Player**: Full-featured video modal with controls, progress bar, and fullscreen support
- 📸 **Photo Gallery**: Responsive photo grid with hover effects
- 🎨 **Modern UI**: Clean, professional design with smooth animations
- 📱 **Responsive**: Mobile-friendly design that works on all devices
- 🏷️ **Category Filtering**: Filter videos and photos by categories and tags
- 🎯 **Interactive Elements**: Hover effects, ripple animations, and smooth scrolling

### Backend
- 🗄️ **SQLite Database**: Lightweight, file-based database for easy deployment
- 📁 **File Upload**: Secure file upload with type validation and size limits
- 🔒 **Security**: Helmet.js for security headers, CORS support
- 📊 **API Endpoints**: RESTful API for CRUD operations on videos and photos
- 🏷️ **Categories**: Organized content management with categories and tags

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Styling**: Custom CSS with Font Awesome icons

## Project Structure

```
EasterBlog/
├── backend/                    # Backend server
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── uploads/               # Uploaded media files
│   │   ├── videos/           # Video files
│   │   └── photos/           # Photo files
│   └── easterblog.db         # SQLite database
├── index.html                 # Main homepage
├── videos.html               # Video gallery page
├── photos.html               # Photo gallery page
├── admin.html                # Admin panel
├── styles.css                # Main stylesheet
├── script.js                 # Frontend JavaScript
├── admin.js                  # Admin panel JavaScript
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (when pushed to git):
   ```bash
   git clone <repository-url>
   cd EasterBlog
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm run dev  # For development (with nodemon)
   # or
   npm start    # For production
   ```

   The server will start on `http://localhost:3001`

4. **Open the frontend**:
   - Open `index.html` in your browser, or
   - Use a local server (recommended for better functionality)

### Development Server

For the best development experience, you can serve the frontend using a simple HTTP server:

```bash
# Using Python (if available)
python -m http.server 3000

# Or using Node.js http-server
npx http-server -p 3000

# Or using PHP
php -S localhost:3000
```

Then visit `http://localhost:3000` for the frontend.

## API Endpoints

### Videos
- `GET /api/videos` - Get all videos (with optional category filtering)
- `GET /api/videos/:id` - Get single video
- `POST /api/videos` - Upload new video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Photos
- `GET /api/photos` - Get all photos (with optional category filtering)
- `POST /api/photos` - Upload new photo
- `DELETE /api/photos/:id` - Delete photo

### Categories
- `GET /api/categories/:type` - Get categories for videos or photos

## Admin Panel

Access the admin panel at `admin.html` with passkey: `eastermiracle#1`

Features:
- Upload videos and photos
- View uploaded content previews
- Delete individual items
- Clear all content

## File Upload Specifications

- **Video files**: MP4, AVI, MOV, WMV, FLV, WebM, MKV (max 100MB)
- **Image files**: JPEG, JPG, PNG, GIF, WebP
- **Storage**: Files are stored in `backend/uploads/` directory
- **Database**: Metadata stored in SQLite database

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./easterblog.db
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
```

## Database Schema

### Videos Table
- id (INTEGER, PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- filename (TEXT)
- filepath (TEXT)
- thumbnail (TEXT)
- duration (TEXT)
- category (TEXT)
- tags (TEXT)
- views (INTEGER)
- likes (INTEGER)
- uploaded_by (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### Photos Table
- id (INTEGER, PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- filename (TEXT)
- filepath (TEXT)
- category (TEXT)
- tags (TEXT)
- likes (INTEGER)
- uploaded_by (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### Categories Table
- id (INTEGER, PRIMARY KEY)
- name (TEXT, UNIQUE)
- type (TEXT) - 'video' or 'photo'
- created_at (DATETIME)

## Deployment

### For Production
1. Set `NODE_ENV=production` in `.env`
2. Run `npm start` instead of `npm run dev`
3. Consider using a process manager like PM2
4. Set up proper file permissions for uploads directory

### Database Backup
The SQLite database file (`easterblog.db`) should be regularly backed up. The uploads directory should also be included in backups.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues or questions, please create an issue in the repository or contact the maintainers.
