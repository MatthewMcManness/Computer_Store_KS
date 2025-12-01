/**
 * Gallery Manager API
 * Handles GitHub commits for the web-based gallery manager
 *
 * SECURITY HARDENED VERSION
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - required when running behind Nginx reverse proxy
app.set('trust proxy', 1);

// Security: Require ADMIN_PASSWORD to be set
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('ERROR: ADMIN_PASSWORD must be set in environment variables (minimum 8 characters)');
  process.exit(1);
}

// GitHub configuration (set via environment variables)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'MatthewMcManness';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Computer_Store_KS';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

// Allowed origins for CORS (configure for your deployment)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://computerstoreks.com',
  'https://computerstoreks.com',
  'http://www.computerstoreks.com',
  'https://www.computerstoreks.com',
  'http://thecomputerstoreks.com',
  'https://thecomputerstoreks.com',
  'http://www.thecomputerstoreks.com',
  'https://www.thecomputerstoreks.com',
  process.env.SITE_URL
].filter(Boolean);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - restrict to allowed origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

// Initialize Octokit
const octokit = GITHUB_TOKEN ? new Octokit({ auth: GITHUB_TOKEN }) : null;

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

/**
 * Timing-safe password comparison to prevent timing attacks
 */
function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Still do comparison to maintain constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitize filename to prevent path traversal
 */
function sanitizeFilename(filename) {
  // Get just the base name
  const base = path.basename(filename);
  // Only allow alphanumeric, dash, underscore, and dot
  const sanitized = base.replace(/[^a-zA-Z0-9_.-]/g, '');
  // Must end with valid extension
  if (!/\.(jpg|jpeg|png)$/i.test(sanitized)) {
    return null;
  }
  return sanitized;
}

/**
 * Authentication middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  if (secureCompare(token, ADMIN_PASSWORD)) {
    next();
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}

/**
 * Health check endpoint (no sensitive info)
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * Login verification endpoint with rate limiting
 */
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }

  if (secureCompare(password, ADMIN_PASSWORD)) {
    res.json({
      success: true,
      message: 'Authentication successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid password'
    });
  }
});

/**
 * Get current gallery.html content
 */
app.get('/api/gallery/html', authenticate, async (req, res) => {
  try {
    const galleryPath = path.join(__dirname, '..', 'gallery.html');
    const content = await fs.readFile(galleryPath, 'utf8');

    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error reading gallery.html:', error.message);
    res.status(500).json({
      error: 'Failed to read gallery content'
    });
  }
});

/**
 * Update gallery and commit to GitHub
 */
app.post('/api/gallery/update', authenticate, async (req, res) => {
  try {
    const { htmlContent, commitMessage } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    if (!octokit) {
      return res.status(500).json({
        success: false,
        error: 'GitHub integration not configured'
      });
    }

    // Get current file SHA
    const { data: currentFile } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'gallery.html',
      ref: GITHUB_BRANCH
    });

    // Update file
    const updateResult = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'gallery.html',
      message: commitMessage || 'Update gallery via Web Gallery Manager',
      content: Buffer.from(htmlContent).toString('base64'),
      sha: currentFile.sha,
      branch: GITHUB_BRANCH
    });

    res.json({
      success: true,
      message: 'Gallery committed to GitHub successfully',
      commitSha: updateResult.data.commit.sha
    });

  } catch (error) {
    console.error('Error updating gallery:', error.message);
    res.status(500).json({
      error: 'Failed to update gallery'
    });
  }
});

/**
 * Upload and optimize image
 */
app.post('/api/gallery/upload-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { type } = req.body;

    if (!type || !['desktop', 'laptop'].includes(type)) {
      return res.status(400).json({ error: 'Invalid computer type' });
    }

    // Verify image magic bytes
    const buffer = req.file.buffer;
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

    if (!isJPEG && !isPNG) {
      return res.status(400).json({ error: 'Invalid image file' });
    }

    // Find next available number
    const galleryDir = path.join(__dirname, '..', 'assets', 'gallery');
    await fs.mkdir(galleryDir, { recursive: true });

    const files = await fs.readdir(galleryDir);
    const existingNumbers = files
      .filter(f => f.startsWith(type))
      .map(f => {
        const match = f.match(new RegExp(`${type}-(\\d+)\\.jpg`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const filename = `${type}-${nextNumber}.jpg`;
    const filepath = path.join(galleryDir, filename);

    // Optimize and resize image
    await sharp(req.file.buffer)
      .resize(1200, 900, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(filepath);

    // Commit image to GitHub
    if (octokit) {
      try {
        const imageBuffer = await fs.readFile(filepath);

        await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: `assets/gallery/${filename}`,
          message: `Add gallery image: ${filename}`,
          content: imageBuffer.toString('base64'),
          branch: GITHUB_BRANCH
        });
      } catch (githubError) {
        console.error('GitHub image upload error:', githubError.message);
      }
    }

    res.json({
      success: true,
      filename,
      path: `./assets/gallery/${filename}`
    });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({
      error: 'Failed to upload image'
    });
  }
});

/**
 * Delete image file
 */
app.delete('/api/gallery/image/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename
    const safeFilename = sanitizeFilename(filename);
    if (!safeFilename) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(__dirname, '..', 'assets', 'gallery', safeFilename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete local file
    await fs.unlink(filepath);

    // Delete from GitHub
    if (octokit) {
      try {
        const { data: currentFile } = await octokit.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: `assets/gallery/${safeFilename}`,
          ref: GITHUB_BRANCH
        });

        await octokit.repos.deleteFile({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: `assets/gallery/${safeFilename}`,
          message: `Delete gallery image: ${safeFilename}`,
          sha: currentFile.sha,
          branch: GITHUB_BRANCH
        });
      } catch (githubError) {
        console.error('GitHub image deletion error:', githubError.message);
      }
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error.message);
    res.status(500).json({
      error: 'Failed to delete image'
    });
  }
});

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 submissions per hour
  message: { error: 'Too many contact submissions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'contact@computerstoreks.com';

/**
 * Contact form submission endpoint
 */
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message, website } = req.body;

    // Honeypot check - if website field is filled, it's a bot
    if (website) {
      // Silently accept but don't process
      return res.json({
        success: true,
        message: 'Thank you for your message!'
      });
    }

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 254),
      phone: phone ? phone.trim().substring(0, 20) : '',
      message: message.trim().substring(0, 5000)
    };

    // Check if email is configured
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('Contact form submission (email not configured):', sanitizedData);
      return res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Send notification email
    await transporter.sendMail({
      from: `"Computer Store Kansas" <${EMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      replyTo: sanitizedData.email,
      subject: `New Contact Form Submission from ${sanitizedData.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedData.name}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Phone:</strong> ${sanitizedData.phone || 'Not provided'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from Computer Store Kansas website contact form</small></p>
      `
    });

    // Send confirmation to user
    await transporter.sendMail({
      from: `"Computer Store Kansas" <${EMAIL_USER}>`,
      to: sanitizedData.email,
      subject: 'We received your message - Computer Store Kansas',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${sanitizedData.name},</p>
        <p>We have received your message and will get back to you within 24 hours.</p>
        <p>If you need immediate assistance, please call us at <strong>(785) 267-3223</strong>.</p>
        <hr>
        <p><strong>Your message:</strong></p>
        <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>Computer Store Kansas<br>(785) 267-3223</p>
      `
    });

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({
      error: 'Failed to send message. Please try again or call us at (785) 267-3223.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gallery Manager API running on port ${PORT}`);
  console.log(`GitHub integration: ${octokit ? 'Enabled' : 'Disabled'}`);
});

module.exports = app;
