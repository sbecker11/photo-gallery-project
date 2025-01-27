// path: /src/index.js
// timestamp: 2025-01-26T06:09:23

import { generateGalleryHtml } from './galleryHtml.js';

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.innerHTML = generateGalleryHtml();
});