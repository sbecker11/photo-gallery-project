// path: server.mjs
// generated on: 2023-10-10T10:00:00Z
import { MosaicGallery } from './src/index.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import apiRouter from './src/api.js';
import dotenv from 'dotenv';
import fs from 'fs';
import { generateGalleryHtml } from './src/galleryHtml.js';
import { initializeGallery } from './src/galleryInit.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load properties from app.properties
dotenv.config({ path: path.join(__dirname, 'app.properties') });

// Create Express app
const app = express();
app.use(express.json());

// Use API routes
app.use(apiRouter);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve images statically
const imagesDirectory = process.env.scan_root;
const outputDirectory = path.join(process.env.cache_root, `thumbnails_${process.env.thumbnail_percentage}`);
app.use('/images', express.static(imagesDirectory));
app.use('/thumbnails', express.static(outputDirectory));

// Serve the gallery.html file at root
app.get('/', (req, res) => {
    const galleryImageSize = parseInt(process.env.gallery_image_size, 10);
    res.send(generateGalleryHtml(galleryImageSize));
});

// Initialize gallery
const testDir = imagesDirectory;
const outputPath = path.join(__dirname, 'public', 'gallery-content.html');

initializeGallery(testDir, outputPath, {
    width: parseInt(process.env.gallery_width, 10),
    height: parseInt(process.env.gallery_height, 10),
    thumbnailPercentage: parseFloat(process.env.thumbnail_percentage) / 100,
    outputPath: outputDirectory
}).then(() => {
    // Start server
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('Open http://localhost:3000 in your browser to view the gallery');
    });
}).catch(error => console.error('Error creating gallery:', error));