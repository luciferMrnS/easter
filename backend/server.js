const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
        contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
              fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://via.placeholder.com"],
              mediaSrc: ["'self'", "https://res.cloudinary.com"],
              connectSrc: ["'self'"]
            }
          }
}));
app.use(cors());
app.use(express.json());
// Serve static files from the root directory (for HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, '..')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const photosDir = path.join(uploadsDir, 'photos');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}
if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir);
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Database setup
const db = new sqlite3.Database('./easterblog.db', async (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database.');
        try {
            await initializeDatabase();
            console.log('Database fully initialized. Starting server...');
            startServer();
        } catch (error) {
            console.error('Failed to initialize database:', error);
            process.exit(1);
        }
    }
});

// Initialize database tables
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Videos table
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            thumbnail TEXT,
            duration TEXT,
            category TEXT DEFAULT 'general',
            tags TEXT,
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            featured INTEGER DEFAULT 0,
            uploaded_by TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating videos table:', err.message);
                reject(err);
                return;
            }

            // Photos table
            db.run(`CREATE TABLE IF NOT EXISTS photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                tags TEXT,
                likes INTEGER DEFAULT 0,
                uploaded_by TEXT DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating photos table:', err.message);
                    reject(err);
                    return;
                }

                // Blog posts table
                db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    excerpt TEXT,
                    category TEXT DEFAULT 'general',
                    tags TEXT,
                    featured_image TEXT,
                    author TEXT DEFAULT 'admin',
                    views INTEGER DEFAULT 0,
                    likes INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'published',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) {
                        console.error('Error creating blog_posts table:', err.message);
                        reject(err);
                        return;
                    }

                    // Contact messages table
                    db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL,
                        message TEXT NOT NULL,
                        status TEXT DEFAULT 'unread',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`, (err) => {
                        if (err) {
                            console.error('Error creating contact_messages table:', err.message);
                            reject(err);
                            return;
                        }

                        // Categories table for better organization
                        db.run(`CREATE TABLE IF NOT EXISTS categories (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL UNIQUE,
                            type TEXT NOT NULL, -- 'video' or 'photo'
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`, (err) => {
                            if (err) {
                                console.error('Error creating categories table:', err.message);
                                reject(err);
                                return;
                            }

                            // Insert default categories
                            const defaultCategories = [
                                ['Easter Specials', 'video'],
                                ['Cooking', 'video'],
                                ['Traditions', 'video'],
                                ['Adventures', 'video'],
                                ['General', 'video'],
                                ['Easter Photos', 'photo'],
                                ['Family', 'photo'],
                                ['Decorations', 'photo'],
                                ['Nature', 'photo'],
                                ['General', 'photo']
                            ];

                            let completed = 0;
                            const total = defaultCategories.length;

                            defaultCategories.forEach(([name, type]) => {
                                db.run('INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)', [name, type], (err) => {
                                    if (err) {
                                        console.error('Error inserting category:', err.message);
                                    }
                                    completed++;
                                    if (completed === total) {
                                        console.log('Database initialized successfully');
                                        resolve();
                                    }
                                });
                            });

                            // Handle case where no categories to insert
                            if (total === 0) {
                                console.log('Database initialized successfully');
                                resolve();
                            }
                        });
                    });
                });
            });
        });
    });
}

// Multer configuration for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedVideoTypes = /mp4/;
        const allowedImageTypes = /jpeg|jpg|png|gif|webp/;

        const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                       allowedImageTypes.test(path.extname(file.originalname).toLowerCase());

        const mimetype = file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4 videos and JPEG/PNG/GIF/WebP images are allowed.'));
        }
    }
});

// Helper function to upload to Cloudinary
async function uploadToCloudinary(buffer, folder, resourceType = 'auto') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
                public_id: Date.now() + '-' + Math.round(Math.random() * 1E9)
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
}

// API Routes

// Get all videos
app.get('/api/videos', (req, res) => {
    const { category, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM videos ORDER BY created_at DESC';
    let params = [];

    if (category && category !== 'all') {
        query = 'SELECT * FROM videos WHERE category = ? ORDER BY created_at DESC';
        params = [category];
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get featured video
app.get('/api/videos/featured', (req, res) => {
    console.log('Getting featured video...');
    db.get('SELECT * FROM videos WHERE featured = 1 LIMIT 1', (err, row) => {
        if (err) {
            console.error('Database error getting featured video:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Featured video query result:', row);
        if (row) {
            console.log('Found featured video:', row.title);
            res.json(row);
        } else {
            console.log('No featured video found');
            res.json(null);
        }
    });
});

// Get single video
app.get('/api/videos/:id', (req, res) => {
    db.get('SELECT * FROM videos WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(row);
    });
});

// Upload video
app.post('/api/videos', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    try {
        // Use local storage
        const videoFilename = Date.now() + '-' + req.file.originalname;
        const videoPath = path.join(videosDir, videoFilename);
        fs.writeFileSync(videoPath, req.file.buffer);

        const filepath = `/uploads/videos/${videoFilename}`;
        const filename = videoFilename;
        const thumbnail = null;

        const { title, description, category = 'general', tags } = req.body;

        const videoData = {
            title: title || req.file.originalname,
            description: description || '',
            filename: filename,
            filepath: filepath,
            thumbnail: thumbnail,
            category,
            tags: tags || '',
            uploaded_by: 'admin'
        };

        const sql = `INSERT INTO videos (title, description, filename, filepath, thumbnail, category, tags, uploaded_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [
            videoData.title,
            videoData.description,
            videoData.filename,
            videoData.filepath,
            videoData.thumbnail,
            videoData.category,
            videoData.tags,
            videoData.uploaded_by
        ], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log('Video saved to database with ID:', this.lastID);
            // Return the created video
            db.get('SELECT * FROM videos WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json(row);
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload video to Cloudinary' });
    }
});

// Update video
app.put('/api/videos/:id', (req, res) => {
    const { title, description, category, tags } = req.body;

    const sql = `UPDATE videos SET
                 title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 category = COALESCE(?, category),
                 tags = COALESCE(?, tags),
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

    db.run(sql, [title, description, category, tags, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json({ message: 'Video updated successfully' });
    });
});

// Update photo
app.put('/api/photos/:id', (req, res) => {
    const { title, description, category, tags } = req.body;

    const sql = `UPDATE photos SET
                 title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 category = COALESCE(?, category),
                 tags = COALESCE(?, tags),
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

    db.run(sql, [title, description, category, tags, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        res.json({ message: 'Photo updated successfully' });
    });
});

// Delete video
app.delete('/api/videos/:id', async (req, res) => {
    // First get the video data
    db.get('SELECT filename, filepath FROM videos WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Check if it's a Cloudinary URL (contains cloudinary.com)
            if (row.filepath && row.filepath.includes('cloudinary.com')) {
                // Delete from Cloudinary using public_id
                cloudinary.uploader.destroy(row.filename, { resource_type: 'video' }, (error, result) => {
                    // Continue even if Cloudinary delete fails
                    if (error) {
                        console.error('Cloudinary delete error:', error);
                    }
                });
            } else {
                // Delete local file
                const localFilePath = path.join(__dirname, 'uploads', 'videos', row.filename);
                if (fs.existsSync(localFilePath)) {
                    fs.unlinkSync(localFilePath);
                }
            }
        }

        // Delete from database
        db.run('DELETE FROM videos WHERE id = ?', [req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Video not found' });
            }
            res.json({ message: 'Video deleted successfully' });
        });
    });
});

// Set video as featured
app.put('/api/videos/:id/featured', (req, res) => {
    const videoId = req.params.id;
    const { featured } = req.body;

    console.log('Setting video featured status:', { videoId, featured });

    // First, check if video exists
    db.get('SELECT id FROM videos WHERE id = ?', [videoId], (err, row) => {
        if (err) {
            console.error('Error checking video existence:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            console.log('Video not found:', videoId);
            return res.status(404).json({ error: 'Video not found' });
        }

        console.log('Video found, proceeding with featured update');

        // If setting as featured, first unset all other featured videos
        if (featured) {
            db.run('UPDATE videos SET featured = 0 WHERE featured = 1', (err) => {
                if (err) {
                    console.error('Error unsetting other featured videos:', err);
                    return res.status(500).json({ error: err.message });
                }

                console.log('Unset other featured videos, now setting new one');
                // Now set this video as featured
                db.run('UPDATE videos SET featured = 1 WHERE id = ?', [videoId], function(err) {
                    if (err) {
                        console.error('Error setting video as featured:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('Video set as featured successfully');
                    res.json({ message: 'Video set as featured successfully' });
                });
            });
        } else {
            // Unset featured
            db.run('UPDATE videos SET featured = 0 WHERE id = ?', [videoId], function(err) {
                if (err) {
                    console.error('Error unsetting featured status:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log('Video removed from featured successfully');
                res.json({ message: 'Video removed from featured successfully' });
            });
        }
    });
});

// Get all photos
app.get('/api/photos', (req, res) => {
    const { category, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM photos ORDER BY created_at DESC';
    let params = [];

    if (category && category !== 'all') {
        query = 'SELECT * FROM photos WHERE category = ? ORDER BY created_at DESC';
        params = [category];
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Upload photo
app.post('/api/photos', upload.single('photo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No photo file provided' });
    }

    try {
        // Use local storage
        const photoFilename = Date.now() + '-' + req.file.originalname;
        const photoPath = path.join(photosDir, photoFilename);
        fs.writeFileSync(photoPath, req.file.buffer);

        const filepath = `/uploads/photos/${photoFilename}`;
        const filename = photoFilename;

        const { title, description, category = 'general', tags } = req.body;

        const photoData = {
            title: title || req.file.originalname,
            description: description || '',
            filename: filename,
            filepath: filepath,
            category,
            tags: tags || '',
            uploaded_by: 'admin'
        };

        const sql = `INSERT INTO photos (title, description, filename, filepath, category, tags, uploaded_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [
            photoData.title,
            photoData.description,
            photoData.filename,
            photoData.filepath,
            photoData.category,
            photoData.tags,
            photoData.uploaded_by
        ], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log('Photo saved to database with ID:', this.lastID);
            // Return the created photo
            db.get('SELECT * FROM photos WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json(row);
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload photo to Cloudinary' });
    }
});

// Delete photo
app.delete('/api/photos/:id', async (req, res) => {
    // First get the photo data
    db.get('SELECT filename, filepath FROM photos WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Check if it's a Cloudinary URL (contains cloudinary.com)
            if (row.filepath && row.filepath.includes('cloudinary.com')) {
                // Delete from Cloudinary using public_id
                cloudinary.uploader.destroy(row.filename, { resource_type: 'image' }, (error, result) => {
                    // Continue even if Cloudinary delete fails
                    if (error) {
                        console.error('Cloudinary delete error:', error);
                    }
                });
            } else {
                // Delete local file
                const localFilePath = path.join(__dirname, 'uploads', 'photos', row.filename);
                if (fs.existsSync(localFilePath)) {
                    fs.unlinkSync(localFilePath);
                }
            }
        }

        // Delete from database
        db.run('DELETE FROM photos WHERE id = ?', [req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Photo not found' });
            }
            res.json({ message: 'Photo deleted successfully' });
        });
    });
});

// Get categories
app.get('/api/categories/:type', (req, res) => {
    db.all('SELECT * FROM categories WHERE type = ? ORDER BY name', [req.params.type], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get all blog posts
app.get('/api/blog-posts', (req, res) => {
    const { category, limit = 50, offset = 0, status = 'published' } = req.query;

    let query = 'SELECT * FROM blog_posts WHERE status = ? ORDER BY created_at DESC';
    let params = [status];

    if (category && category !== 'all') {
        query = 'SELECT * FROM blog_posts WHERE status = ? AND category = ? ORDER BY created_at DESC';
        params = [status, category];
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single blog post
app.get('/api/blog-posts/:id', (req, res) => {
    db.get('SELECT * FROM blog_posts WHERE id = ? AND status = "published"', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.json(row);
    });
});

// Create blog post
app.post('/api/blog-posts', async (req, res) => {
    const { title, content, excerpt, category = 'general', tags, featured_image, status = 'published' } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    // Generate excerpt if not provided
    const generatedExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

    const sql = `INSERT INTO blog_posts (title, content, excerpt, category, tags, featured_image, author, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
        title,
        content,
        generatedExcerpt,
        category,
        tags || '',
        featured_image || '',
        'admin',
        status
    ], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Return the created blog post
        db.get('SELECT * FROM blog_posts WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json(row);
        });
    });
});

// Update blog post
app.put('/api/blog-posts/:id', (req, res) => {
    const { title, content, excerpt, category, tags, featured_image, status } = req.body;

    const sql = `UPDATE blog_posts SET
                 title = COALESCE(?, title),
                 content = COALESCE(?, content),
                 excerpt = COALESCE(?, excerpt),
                 category = COALESCE(?, category),
                 tags = COALESCE(?, tags),
                 featured_image = COALESCE(?, featured_image),
                 status = COALESCE(?, status),
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

    db.run(sql, [title, content, excerpt, category, tags, featured_image, status, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.json({ message: 'Blog post updated successfully' });
    });
});

// Delete blog post
app.delete('/api/blog-posts/:id', (req, res) => {
    db.run('DELETE FROM blog_posts WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.json({ message: 'Blog post deleted successfully' });
    });
});

// Submit contact message
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const sql = `INSERT INTO contact_messages (name, email, message)
                 VALUES (?, ?, ?)`;

    db.run(sql, [name.trim(), email.trim(), message.trim()], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            message: 'Contact message sent successfully'
        });
    });
});

// Get all contact messages
app.get('/api/contact', (req, res) => {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
    let params = [];

    if (status && status !== 'all') {
        query = 'SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC';
        params = [status];
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Update contact message status
app.put('/api/contact/:id', (req, res) => {
    const { status } = req.body;

    if (!status || !['read', 'unread', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'Valid status (read, unread, archived) is required' });
    }

    db.run('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Contact message not found' });
        }
        res.json({ message: 'Contact message status updated successfully' });
    });
});

// Delete contact message
app.delete('/api/contact/:id', (req, res) => {
    db.run('DELETE FROM contact_messages WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Contact message not found' });
        }
        res.json({ message: 'Contact message deleted successfully' });
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Start server function
function startServer() {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Uploads directory: ${uploadsDir}`);
        console.log(`Frontend available at: http://localhost:${PORT}`);
        console.log(`Admin panel at: http://localhost:${PORT}/admin.html`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing database connection...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

module.exports = app;
