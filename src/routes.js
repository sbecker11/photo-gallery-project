import express from 'express';
import { generateGalleryHtml } from './galleryHtml.js';
import { appConstants } from '../server.mjs';

export const mainRouter = express.Router();

// Serve the gallery.html file dynamically
mainRouter.get('/', async (req, res) => {
    try {
        const galleryHtml = await generateGalleryHtml(appConstants);
        res.send(galleryHtml);
    } catch (error) {
        console.error("Error in generateGalleryHtml:", error);
        res.status(500).send('Internal Server Error14');
    }
});

