import sharp from 'sharp';
import { extname, basename } from 'path';

export const supportedImageExtensionsList = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];

export async function getImageFileMetadata(imagePath) {
    const ext = extname(imagePath).toLowerCase();
    const fileName = basename(imagePath);
    if ( fileName.startsWith('.') || !supportedImageExtensionsList.includes(ext)) {
        console.log(`fileName: ${fileName} skipping unsupported extension: ${ext}`);
        return null;
    }

    try {
        const metadata = await sharp(imagePath).metadata();
        return {
            fileName: fileName,
            extension: ext,
            width: metadata.width,
            height: metadata.height
        };
    } catch (error) {
        throw new Error(`Error processing image:${imagePath} ${error.message}`);
    }
}

async function main(imagePath) {
    const fileName = basename(imagePath);
    try {
        const dimensions = await getImageFileMetadata(imagePath);
        if ( dimensions ) {
            console.log(`fileName: ${fileName}, Width: ${dimensions.width}, Height: ${dimensions.height}`);
        }
        else {
            console.error(`fileName: ${fileName} no dimensions`);
        }
    }
    catch (error) {
        console.error(`fileName: ${fileName} error:`, error.message);
    }
}

// // Check if an argument (image path) is provided
// if (process.argv.length !== 3) {
//     console.error('Usage: node script.js <path-to-image>');
//     process.exit(1);
// }

// const imagePath = process.argv[2]; // Command line argument is the second item in argv array
// main(imagePath);