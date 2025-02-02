import express from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs-extra';
import { getImageFileMetadata } from './imageUtils.js';
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), '.temp');
fs.ensureDirSync(tempDir);

// Example API endpoint to get image metadata
router.get('/api/image-metadata', async (req, res) => {
    const imagePath = req.query.path;
    try {
        const metadata = await getImageFileMetadata(imagePath);
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/image-operation', async (req, res) => {
    try {
        const { imagePath, operation, rotation } = req.body;
        const tempPath = path.join(tempDir, `temp_${path.basename(imagePath)}`);
        let pipeline = sharp(imagePath);

        switch (operation) {
            case 'rotate':
                pipeline = pipeline.rotate(rotation);
                break;

            case 'histogram':
                pipeline = pipeline.modulate({
                    brightness: 1,
                    saturation: 1
                }).normalise();
                break;

            case 'greyscale':
                pipeline = pipeline.grayscale();
                break;
        }

        await pipeline.toFile(tempPath);
        res.json({ tempPath: `file://${tempPath}` });

    } catch (error) {
        res.status(500).json({ error43: error.message });
    }
});

router.post('/api/save-image', async (req, res) => {
    try {
        const { imagePath, mode } = req.body;
        const parsedPath = path.parse(imagePath);
        let newPath;

        if (mode === 'copy') {
            // Find next available copy number
            let copyNum = 1;
            do {
                newPath = path.join(
                    parsedPath.dir,
                    `${parsedPath.name}-copy${copyNum}${parsedPath.ext}`
                );
                copyNum++;
            } while (await fs.pathExists(newPath));
        } else {
            newPath = imagePath;
        }

        const tempPath = path.join(tempDir, `temp_${path.basename(imagePath)}`);
        await fs.move(tempPath, newPath, { overwrite: true });

        res.json({ newPath: `file://${newPath}` });

    } catch (error) {
        res.status(500).json({ error73: error.message });
    }
});

router.post('/api/move-to-deleted', async (req, res) => {
    try {
        const { imagePath } = req.body;
        const deletedDir = path.join(path.dirname(imagePath), '.deleted');
        await fs.ensureDir(deletedDir);

        const newPath = path.join(deletedDir, path.basename(imagePath));
        await fs.move(imagePath, newPath);

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error89: error.message });
    }
});

export default router;