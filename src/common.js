import { appConstants } from '../server.mjs';
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { basename } from 'path';
import { getImageFileMetadata } from './imageUtils.js';

async function findAllImageObjects(dir, imageObjects = []) {
    const files = await fs.readdir(dir); // read the content of the directory
    for (const file of files) {
        // Ignore files or folders beginning with a dot
        if (file.startsWith('.')) continue;

        const filePath = path.join(dir, file);
        const fileStat = await fs.stat(filePath);

        if (fileStat.isDirectory()) {
            // Skip specified folders
            if (appConstants.noScanFolderNames.includes(filePath)) continue;

            // Recursive call to process the contents of the directory
            await findAllImageObjects(filePath, imageObjects);

        } else if (fileStat.isFile() && appConstants.supportedImageExtensionsList.includes(path.extname(filePath).toLowerCase())) {

            // Get imageMetadata
            let imageMetadata = null;
            try {
                imageMetadata = await getImageFileMetadata(filePath);
            } catch (error) {
                console.error("imageMetadata error file:"+file+" error:" + error.message);
                continue;
            }
            if (!imageMetadata) {
                console.error("imageMetadata null for file:"+file);
                continue;
            }

            // Add the file and its imageMetadata to the list of imageObjects
            const imageName = file;
            const imageStat = fileStat;
            const imagePath = filePath;
            const imageRelativePath = path.relative(appConstants.imageRootPath, imagePath);
            const thumbnailRelativePath = imageRelativePath.toLowerCase().replace(/[\s\/]/g, '-');
            const imageUrl = `${appConstants.imageRootUrl}/${imageRelativePath}`;
            const cachedThumbnailUrl = `${appConstants.cacheThumbnailRootUrl}/${thumbnailRelativePath}`;
            const cachedThumbnailPath = path.join(appConstants.cacheThumbnailRootPath, thumbnailRelativePath);
            imageObjects.push({
                imageName: imageName,           // baseName of the imageFile with extension
                imageStat: imageStat,           // from fs.stat on imagePath
                imagePath: imagePath,           // absolute path of the imageFile
                imageUrl: imageUrl,             // url of the imageFile
                cachedThumbnailPath: cachedThumbnailPath,   // absolute path of the cached scaled thumbnail
                cachedThumbnailUrl: cachedThumbnailUrl,     // url of the cached scaled thumbnail
                imageWidth: imageMetadata.width,     // pixel width of the imageFile
                imageHeight: imageMetadata.height    // pixel height of the imageFile
            });
        }
    }
    return imageObjects;
}

// refresh the cached thumbnails where needed.
// return a list of all valid cachedThumbnailPaths.
// if thumbnail creation fails, remove it so it will
// attempt to be generated in the next refreshCachedThumbnails call.

export async function refreshCachedThumbnails(imageObjects) {
    const cachedThumbnailPaths = [];
    for (const imageObject of imageObjects) {
        const cachedThumbnailPath = imageObject.cachedThumbnailPath;
        const cachedThumbnailExists = await fs.pathExists(cachedThumbnailPath);
        const imageFileStat = await fs.stat(imageObject.imagePath);
        const imageMtime = imageFileStat.mtime;
        const cachedThumbnailStat = cachedThumbnailExists ? await fs.stat(cachedThumbnailPath) : null;

        // thumbnail doesn't exist so generate it
        if (!cachedThumbnailExists) {
            try {
                await createCachedThumbnail(imageObject);
                cachedThumbnailPaths.push(cachedThumbnailPath);
            } catch (error) {
                console.error('common::refreshCachedThumbnails error generating thumbnail from imagePath:', imageObject.imagePath, error.message);
                // no invalid thumbnail to remove
            }
        }
        // thumbnail exists
        else {
            // but image is newer than thumbnail, so regenerate the thumbnail
            if (cachedThumbnailStat && cachedThumbnailStat.mtime < imageMtime) {
                try {
                    await createCachedThumbnail(imageObject);
                    cachedThumbnailPaths.push(cachedThumbnailPath);
                } catch (error) {
                    console.error('common::refreshCachedThumbnails error generating thumbnail from imagePath:', imageObject.imagePath, error.message);
                    await fs.remove(cachedThumbnailPath);
                    console.error('common::refreshCachedThumbnails removed cachedThumbnailPath:', cachedThumbnailPath, error.message);
                }
            }
            // existing thumbnail is good so add it to the list
            else {
                cachedThumbnailPaths.push(cachedThumbnailPath);
            }
        }
    }
    return cachedThumbnailPaths;
}

// returns the cachedThumbnailPath
async function createCachedThumbnail(imageObject) {
    try {
        // console.log(`common::createCachedThumbnail calling sharp on imagePath: ${imageObject.imagePath} to generate cachedThumbnailPath: ${imageObject.cachedThumbnailPath}`);
        await sharp(imageObject.imagePath)
            .resize({
                width: Math.round(imageObject.imageWidth * appConstants.thumbnailPercentage / 100),
                height: Math.round(imageObject.imageHeight * appConstants.thumbnailPercentage / 100)
            })
            .toFile(imageObject.cachedThumbnailPath);
        return imageObject.cachedThumbnailPath;
    } catch (error) {
        console.error(`common::createCachedThumbnail Ignoring error generating thumbnail from imagePath ${imageObject.imagePath}:`, error.message);
        return null;
    }
}

async function getCachedThumbnail(imageObject) {
    return imageObject.cachedThumbnailPath;
}

function generateThumbnailTileDivHtml(imageObject) {
    return `<div class="image-tile"><a href="${imageObject.cachedThumbnailUrl}" target="_blank"><img src="${imageObject.imageUrl}" alt="${imageObject.imageName}" /></a></div>`;
}

// returns list of all tileDivs as a single Html string
// used as gallery-contents for the gallery page
async function generateThumbnailTileDivsHtml(imageObjects) {
    let tileDivsHtml = "";
    for (const imageObject of imageObjects) {
        tileDivsHtml += generateThumbnailTileDivHtml(imageObject);
    }
    return tileDivsHtml;
}

// Function to refresh the gallery content file with thumbnailDivsHtml
// may raise error
export async function refreshGalleryContentFile() {
    const imageObjects = await findAllImageObjects(appConstants.imageRootPath);
    const thumbnailDivsHtml = await generateThumbnailTileDivsHtml(imageObjects);
    await fs.writeFile(appConstants.cachedThumbnailGalleryContentPath, thumbnailDivsHtml);
}