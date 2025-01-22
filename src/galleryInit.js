// path: src/galleryInit.js
// generated on: 2023-10-10T10:00:00Z
import { MosaicGallery } from './index.js';

export async function initializeGallery(testDir, outputPath, options) {
    const gallery = new MosaicGallery(options);

    console.log('Scanning directory:', testDir);
    console.log('Output directory for resized cached images:', options.outputPath);
    console.log('Thumbnail percentage:', options.thumbnailPercentage * 100); // Log the original value
    console.log('Gallery width:', options.width);
    console.log('Gallery height:', options.height);

    await gallery.createFromDirectories([testDir], outputPath);
    console.log(`Gallery content written to: ${outputPath}`);
}