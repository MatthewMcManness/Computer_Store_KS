/**
 * Gallery Manager API
 * Handles GitHub commits for the web-based gallery manager
 *
 * This simple Express API provides endpoints for:
 * - Reading the current index.html
 * - Updating the gallery HTML
 * - Committing and pushing changes to GitHub
 * - Uploading and optimizing images
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GitHub configuration (set via environment variables)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'matthewholman';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Computer_Store_KS';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'Computer-Store-KS';

// Admin password (set via environment variable)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

/**
 * Authentication middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  // Simple password check (in production, use JWT or proper auth)
  if (token === ADMIN_PASSWORD) {
    next();
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    githubConnected: !!GITHUB_TOKEN
  });
});

/**
 * Login verification endpoint
 */
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
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
 * Get current index.html content
 */
app.get('/api/gallery/html', authenticate, async (req, res) => {
  try {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const content = await fs.readFile(indexPath, 'utf8');

    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error reading index.html:', error);
    res.status(500).json({
      error: 'Failed to read index.html',
      message: error.message
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

    // Write to local file first
    const indexPath = path.join(__dirname, '..', 'index.html');
    await fs.writeFile(indexPath, htmlContent, 'utf8');

    // Create backup
    const backupDir = path.join(__dirname, '..', 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const backupPath = path.join(backupDir, `index_backup_${timestamp}.html`);
    await fs.writeFile(backupPath, htmlContent, 'utf8');

    // Commit to GitHub
    if (GITHUB_TOKEN) {
      try {
        // Get current file SHA
        const { data: currentFile } = await octokit.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: 'index.html',
          ref: GITHUB_BRANCH
        });

        // Update file
        await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: 'index.html',
          message: commitMessage || 'Update gallery via Web Gallery Manager',
          content: Buffer.from(htmlContent).toString('base64'),
          sha: currentFile.sha,
          branch: GITHUB_BRANCH
        });

        res.json({
          success: true,
          message: 'Gallery updated and committed to GitHub',
          backup: backupPath
        });
      } catch (githubError) {
        console.error('GitHub commit error:', githubError);
        res.json({
          success: true,
          message: 'Gallery updated locally but GitHub commit failed',
          error: githubError.message,
          backup: backupPath
        });
      }
    } else {
      res.json({
        success: true,
        message: 'Gallery updated locally (no GitHub token configured)',
        backup: backupPath
      });
    }
  } catch (error) {
    console.error('Error updating gallery:', error);
    res.status(500).json({
      error: 'Failed to update gallery',
      message: error.message
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

    const { type } = req.body; // 'desktop' or 'laptop'

    if (!type || !['desktop', 'laptop'].includes(type)) {
      return res.status(400).json({ error: 'Invalid computer type' });
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
    if (GITHUB_TOKEN) {
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
        console.error('GitHub image upload error:', githubError);
        // Continue even if GitHub fails - image is saved locally
      }
    }

    res.json({
      success: true,
      filename,
      path: `./assets/gallery/${filename}`,
      url: `/assets/gallery/${filename}`
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

/**
 * Delete image file
 */
app.delete('/api/gallery/image/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(__dirname, '..', 'assets', 'gallery', filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete local file
    await fs.unlink(filepath);

    // Delete from GitHub
    if (GITHUB_TOKEN) {
      try {
        const { data: currentFile } = await octokit.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: `assets/gallery/${filename}`,
          ref: GITHUB_BRANCH
        });

        await octokit.repos.deleteFile({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: `assets/gallery/${filename}`,
          message: `Delete gallery image: ${filename}`,
          sha: currentFile.sha,
          branch: GITHUB_BRANCH
        });
      } catch (githubError) {
        console.error('GitHub image deletion error:', githubError);
        // Continue even if GitHub fails
      }
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gallery Manager API running on port ${PORT}`);
  console.log(`GitHub integration: ${GITHUB_TOKEN ? 'Enabled' : 'Disabled (set GITHUB_TOKEN)'}`);
  console.log(`Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`Branch: ${GITHUB_BRANCH}`);
});

module.exports = app;
