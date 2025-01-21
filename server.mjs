import { MosaicGallery } from './src/index.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import apiRouter from './src/api.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());

// Use API routes
app.use(apiRouter);

// Serve the gallery.html file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

// Initialize gallery
const testDir = path.join(process.env.HOME, 'Pictures');
const outputPath = path.join(__dirname, 'gallery.html');

console.log('Scanning directory:', testDir);
console.log('Output will be written to:', outputPath);

const gallery = new MosaicGallery({
    width: 1200,
    thumbnailSize: { width: 400, height: 400 }
});

// Create gallery then start server
gallery.createFromDirectories([testDir], outputPath)
    .then(() => {
        // Start server
        const port = 3000;
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log('Open http://localhost:3000 in your browser to view the gallery');
        });
    })
    .catch(error => console.error('Error creating gallery:', error));

