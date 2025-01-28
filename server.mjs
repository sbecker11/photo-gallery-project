// path: /server.mjs
// timestamp: 2025-01-27T19:10:00Z

import dotenv from 'dotenv';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import apiRouter from './src/api.js';
import { refreshGalleryContentFile } from './src/common.js';
import { supportedImageExtensionsList } from './src/imageUtils.js';
import { validateString, validateInteger, validatePath, getStringList, validateStringList } from './src/validator.js';
import { mainRouter } from './src/routes.js'; // Ensure mainRouter is imported

// Get the path of this server.mjs file
// and to it's parent folder, which is the projectRoot
const __filename = fileURLToPath(import.meta.url);
const projectRoot = dirname(__filename);

// Load properties from app.properties
dotenv.config({ path: path.join(projectRoot, 'app.properties') });

// Create Express app
const app = express();
const port = 3000;

const publicRoot = validatePath(path.join(projectRoot, 'public'), 'publicRoot');
const scanRoot = validatePath(process.env.scanRoot, 'scanRoot');
const cacheRoot = validatePath(process.env.cacheRoot, 'cacheRoot');
const thumbnailPercentage = validateInteger(process.env.thumbnailPercentage, 'thumbnailPercentage');
const cacheThumbnailRoot = path.join(cacheRoot,`thumbnails-${thumbnailPercentage}`);
const noScanFolderNames = getStringList(process.env.noScanFolderNames,'noScanFolderNames');
const cachedThumbnailGalleryContentPath = validatePath(path.join(cacheThumbnailRoot,'gallery.html'), 'cachedThumbnailGalleryContentPath');
const appServerLogPath = validatePath(process.env.appServerLogPath, 'appServerLogPath');

// this is globally accessible in the server code
// using import { appConstants } from '../server.mjs';
export const appConstants = Object.freeze({
    imageRootUrl: "/images",
    cacheThumbnailRootUrl: "/thumbnails",
    imageRootPath: scanRoot,
    cacheThumbnailRootPath: cacheThumbnailRoot,
    noScanFolderNames: validateStringList(noScanFolderNames, 'noScanFolderNames'),
    supportedImageExtensionsList: validateStringList(supportedImageExtensionsList,'supportedImageExtensionsList'),
    thumbnailPercentage: thumbnailPercentage,
    galleryWidth: validateInteger(process.env.galleryWidth, 'galleryWidth'),
    galleryHeight: validateInteger(process.env.galleryHeight, 'galleryHeight'),
    cachedThumbnailGalleryContentPath: cachedThumbnailGalleryContentPath,
    appServerLogPath: appServerLogPath
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files using 'public'
app.use('/', express.static(publicRoot));

// Serve static files for requests that lack a leading slash
app.use(express.static(publicRoot));

// Serve static files from the 'scanRoot' directory at the '/images' URL path
app.use('/images', express.static(scanRoot));

// Serve static files from the 'cacheThumbnailRoot' directory at the '/thumbnails' URL path
app.use('/thumbnails', express.static(cacheThumbnailRoot));

// Use the main router for application routes
app.use(mainRouter);

// Use the API router for API routes
app.use('/api', apiRouter);

function parseDivs(htmlString) {
    htmlString = validateString(htmlString, 'htmlString');
    // Regular expression to match each <div> element with class "image-tile"
    const divRegex = /<div class="image-tile">.*?<\/div>/g;
    // Use the regular expression to find all matches
    const divs = htmlString.match(divRegex);
    return divs || [];
}

async function debugGalleryContentHtml(html) {
    // parse the galleryContentHtml into divs
    const divs = parseDivs(html);
    console.log("galleryContentHtml numDivs:" + divs.length);
}

async function debugGalleryContentFile() {
    const galleryContentPath = appConstants.cachedThumbnailGalleryContentPath;
    console.info("galleryContentPath:", galleryContentPath);
    let html = await fs.readFile(galleryContentPath);
    html = html.toString('utf8');
    html = validateString(html,'html');
    debugGalleryContentHtml(html);
}

// Dynamically serve the gallery-content.html by
// refreshingTheCachedGalleryContent file and then
// sending that file back to the requestor
app.get('/thumbnails/gallery-content.html', async (req, res) => {
    try {
        await refreshGalleryContentFile();
        await debugGalleryContentFile();
        res.sendFile(appConstants.cachedThumbnailGalleryContentPath);
    } catch (error) {
        console.error('Error refreshing gallery content file:', error);
        res.status(500).send('Internal Server Error 76');
    }
});


// Function to initialize the gallery and start the server
function startServer() {
    try {
        // start listening
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log(`Open http://localhost:${port} in your browser to view the gallery`);
        });
    } catch (error) {
        console.error('Error creating gallery:', error);
    }
}

// Call the function to start the server
startServer();

