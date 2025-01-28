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

            const folderName = path.basename(filePath);

            // isNoScanFolder if this folderName matches any of the noScanFolderNames
            const isNoScanFolder = appConstants.noScanFolderNames.includes(folderName);
            if (isNoScanFolder) {
                console.log("Skipping folderPath:", filePath );
                continue;
            }

            // Recursive call to process the contents of the directory
            await findAllImageObjects(filePath, imageObjects);

        } else if (fileStat.isFile() && appConstants.supportedImageExtensionsList.includes(path.extname(filePath).toLowerCase())) {

            // Get imageFileMetadata
            let imageFileMetadata = null;
            try {
                imageFileMetadata = await getImageFileMetadata(filePath);
            } catch (error) {
                console.error(error.message);
                continue;
            }
            if (!imageFileMetadata) {
                console.error("imageFileMetadata null for file:"+file);
                continue;
            }

            // Add the file and its imageFileMetadata to the list of imageObjects
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
                imageWidth: imageFileMetadata.width,     // pixel width of the imageFile
                imageHeight: imageFileMetadata.height    // pixel height of the imageFile
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


// This server-side function, comomon.js::generateThumbnailTileDivHtml, is used to create
// an image-tile div with image tag that includes data attribute "fullSizeImageUrl":
//
// <img src="${imageObject.cachedThumbnailUrl}" data-full-size-image-url="${imageObject.imageUrl}"/>
//
// ThumbnailTileDivs are used by common.js::refreshCachedThumbnails to refresh the server-side
// thumbnails-root/gallery-content.html file for all images with a valid thumbnail image.
//
// On the client side, gallery.js::refreshGalleryContent fetches the gallery-content file from
// the server and loads it into the gallery-content div. Then for the img of each image-tile div
// it retrieves the fullSizeImageUrl from the img.data.fullSizeImageUrl attribute and
// uses it to call document.showFullscreen(fullSizeImageUrl)

function generateThumbnailTileDivHtml(imageObject) {
    // console.log('client::img.src img.dataset.fullSizeImageUrl');
    const thumbnaiilUrl = imageObject.cachedThumbnailUrl;
    const fullsizeImageUrl = imageObject.imageUrl;
    const imgHtml = `<img src="${thumbnaiilUrl}" data-full-size-image-url="${fullsizeImageUrl}"/>`;
    // console.log(imgHtml);
    return `<div class="image-tile">${imgHtml}</div>`;
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

