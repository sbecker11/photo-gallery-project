// path: /public/galleryHtml.js
// timestamp: 2025-01-27T19:30:00Z

import { refreshGlobalEventListeners } from './globalEventLoaders.js';

// this is how to call this function from index.js
// import { initGallery } from './gallery.js';
// document.addEventListener('DOMContentLoaded', () => {
//     initGallery(document);
// });

// initialize the gallery
export function initGallery(document) {

    console.log('initGallery');

    // refresh or load global event loaders if needed
    // before the gallery or its gallery content are loaded
    refreshGlobalEventListeners();

    // fail if required global functions are not defined
    if (!document.showFullscreen) {
        console.error('Error initGallery failed: missing required global functions');
        return null;
    }

    // from this point onwards, this function should only
    // be called when the content or the view parameters change
    refreshGalleryContent();
}

// load or refresh the galleryContent and
// clickEventListeners to the thumbnails
// when images, thumbnails, have changed
// or when view parameters have changed
export function refreshGalleryContent(cols = null, filter = null, sort = null, paginate = null) {

    console.log('refreshGalleryContent');

    // add view parameters to the gallery-content request url
    // so queries can be easily saved and retrieved
    let queryParameters = [];
    if (cols) queryParameters.push(`cols=${encodeURIComponent(cols)}`);
    if (filter) queryParameters.push(`filter=${encodeURIComponent(filter)}`);
    if (sort) queryParameters.push(`sort=${encodeURIComponent(sort)}`);
    if (paginate) queryParameters.push(`paginate=${encodeURIComponent(paginate)}`);
    let viewParameters = queryParameters.length > 0 ? "?" + queryParameters.join('&') : "";

    fetch('/thumbnails/gallery-content.html' + viewParameters)
        .then(response => response.text())
        .then(html => {
            // find the gallery-content div
            const galleryContentDiv = document.getElementById('gallery-content');

            // load the view-enhanced gallery-content html into it
            galleryContentDiv.innerHTML = html;

            // add click event listener to the thumbnail image of each tile
            const imageTiles = galleryContentDiv.querySelectorAll('.image-tile');
            imageTiles.forEach(tile => {
                const img = tile.querySelector('img');
                if (img && img.src) {
                    // from common.js::<img src="${thumbnailUrl}" data-full-size-image-url="${imageUrl}"/>
                    const fullSizeImageUrl = img.dataset.fullSizeImageUrl;
                    if ( fullSizeImageUrl ) {
                        // console.log('server::img src="thumbnailUrl" data-full-size-image-url="imageUrl"');
                        // console.log(`client::img.src:${img.src} img.dataset.fullSizeImageUrl:${fullSizeImageUrl}`);
                        tile.addEventListener('click', () => {
                            document.showFullscreen(fullSizeImageUrl);
                        });
                    } else {
                        console.error('fullSizeImageUrl not found in img:', img);
                    }
                } else {
                    console.error('thumbnail img element or img.src not found in tile:', tile);
                }
            });
        })
        .catch(error => {
            console.error('Error refreshing gallery content:', error);
        });
}



