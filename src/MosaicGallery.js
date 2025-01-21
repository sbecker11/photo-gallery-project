import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export default class MosaicGallery {
    constructor(options = {}) {
        this.width = options.width || 1200;
        this.thumbnailSize = options.thumbnailSize || { width: 400, height: 400 };
        this.cacheDir = path.join(process.cwd(), '.cache');
        this.supportedFormats = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
        this.stats = {
            processed: 0,
            skipped: 0,
            errors: 0,
            total: 0
        };
    }

    async createFromDirectories(directories, outputPath) {
        console.log('Creating gallery from directories:', directories);

        await fs.ensureDir(this.cacheDir);

        const imageFiles = [];
        for (const dir of directories) {
            const files = await glob('**/*.{jpg,jpeg,png,gif,webp,avif}', {
                cwd: dir,
                absolute: true,
                nocase: true
            });
            imageFiles.push(...files);
        }

        this.stats.total = imageFiles.length;
        console.log(`Found ${imageFiles.length} images`);

        const gallery = await this.processImages(imageFiles);

        this.printStats();

        await this.generateHtml(gallery, outputPath);

        return gallery;
    }

    async processImages(imageFiles) {
        const gallery = [];

        for (const file of imageFiles) {
            try {
                const ext = path.extname(file).toLowerCase();
                if (!this.supportedFormats.has(ext)) {
                    console.log(`Skipping unsupported format: ${file}`);
                    this.stats.skipped++;
                    continue;
                }

                const thumbnailPath = path.join(
                    this.cacheDir,
                    `thumb_${path.basename(file)}`
                );

                if (!await fs.pathExists(thumbnailPath)) {
                    try {
                        await sharp(file)
                            .resize(
                                this.thumbnailSize.width,
                                this.thumbnailSize.height,
                                {
                                    fit: 'inside',
                                    withoutEnlargement: true
                                }
                            )
                            .toFile(thumbnailPath);
                        this.stats.processed++;
                    } catch (error) {
                        console.error(`Error creating thumbnail for ${file}:`, error.message);
                        this.stats.errors++;
                        continue;
                    }
                } else {
                    this.stats.processed++;
                }

                gallery.push({
                    original: file,
                    thumbnail: thumbnailPath
                });

                if (this.stats.processed % 100 === 0) {
                    this.printProgress();
                }

            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                this.stats.errors++;
            }
        }

        return gallery;
    }

    async generateHtml(gallery, outputPath) {
        const html = this.createHtmlContent(gallery);
        await fs.writeFile(outputPath, html);
        console.log(`Gallery written to: ${outputPath}`);
    }

    createHtmlContent(gallery) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Photo Gallery</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: #1a1a1a;
                        color: #fff;
                        font-family: Arial, sans-serif;
                    }
                    .gallery {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 20px;
                        padding: 20px;
                    }
                    .image-tile {
                        position: relative;
                        transition: transform 0.3s ease;
                        cursor: pointer;
                        perspective: 1000px;
                    }
                    .image-tile img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 4px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    }
                    .image-tile:hover {
                        transform: scale(1.05) translateZ(20px);
                        z-index: 1000;
                    }
                    .image-tile:hover img {
                        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                    }
                    .fullscreen-viewer {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.9);
                        z-index: 2000;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                    }
                    .fullscreen-viewer img {
                        max-width: 90vw;
                        max-height: 90vh;
                        object-fit: contain;
                        transition: all 0.3s ease;
                    }
                    .viewer-controls {
                        position: fixed;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0,0,0,0.7);
                        padding: 10px 20px;
                        border-radius: 5px;
                        color: white;
                    }
                    .status-message {
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0,0,0,0.7);
                        padding: 10px 20px;
                        border-radius: 5px;
                        color: white;
                        display: none;
                    }
                </style>
                <script>
                    let currentImage = null;
                    let originalImageData = null;
                    let hasChanges = false;
                    let rotation = 0;
                    let fitMode = 'contain';

                    async function showFullscreen(imagePath) {
                        const viewer = document.getElementById('fullscreenViewer');
                        const img = viewer.querySelector('img');
                        currentImage = imagePath;

                        rotation = 0;
                        hasChanges = false;
                        fitMode = 'contain';

                        img.src = imagePath;
                        viewer.style.display = 'flex';
                        updateControls();
                    }

                    function hideFullscreen() {
                        if (hasChanges) {
                            if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                                closeViewer();
                            }
                        } else {
                            closeViewer();
                        }
                    }

                    function closeViewer() {
                        const viewer = document.getElementById('fullscreenViewer');
                        viewer.style.display = 'none';
                        currentImage = null;
                        hasChanges = false;
                    }

                    async function applyImageOperation(operation) {
                        if (!currentImage) return;

                        try {
                            const response = await fetch('/api/image-operation', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    imagePath: currentImage,
                                    operation: operation,
                                    rotation: rotation
                                })
                            });

                            if (!response.ok) throw new Error('Operation failed');

                            const result = await response.json();
                            const viewer = document.getElementById('fullscreenViewer');
                            const img = viewer.querySelector('img');
                            img.src = result.tempPath + '?t=' + new Date().getTime();
                            hasChanges = true;
                            showStatus('Changes applied');
                            updateControls();

                        } catch (error) {
                            showStatus('Error: ' + error.message, 'error');
                        }
                    }

                    function showStatus(message, type = 'info') {
                        const status = document.getElementById('statusMessage');
                        status.textContent = message;
                        status.style.display = 'block';
                        status.style.backgroundColor = type === 'error' ? 'rgba(255,0,0,0.7)' : 'rgba(0,0,0,0.7)';
                        setTimeout(() => {
                            status.style.display = 'none';
                        }, 3000);
                    }

                    function updateControls() {
                        const controls = document.getElementById('viewerControls');
                        controls.innerHTML = \`
                            Rotation: \${rotation}° |
                            Fit: \${fitMode} |
                            \${hasChanges ? 'Unsaved Changes' : 'No Changes'}
                        \`;
                    }

                    document.addEventListener('keydown', async (e) => {
                        if (!currentImage) return;

                        if (e.key === 'Escape') {
                            hideFullscreen();
                            return;
                        }

                        if (e.metaKey || e.ctrlKey) {
                            switch(e.key.toLowerCase()) {
                                case 's':
                                    e.preventDefault();
                                    await saveChanges(e.shiftKey ? 'copy' : 'original');
                                    break;
                            }
                            return;
                        }

                        switch(e.key.toLowerCase()) {
                            case 'f':
                                fitMode = e.shiftKey ? 'cover' : 'contain';
                                document.querySelector('.fullscreen-viewer img').style.objectFit = fitMode;
                                updateControls();
                                break;

                            case 'd':
                                if (await moveToDeleted()) {
                                    closeViewer();
                                    location.reload();
                                }
                                break;

                            case 'r':
                                rotation += e.shiftKey ? -90 : 90;
                                rotation = rotation % 360;
                                await applyImageOperation('rotate');
                                break;

                            case 'h':
                                await applyImageOperation('histogram');
                                break;

                            case 'g':
                                await applyImageOperation('greyscale');
                                break;
                        }
                    });

                    async function saveChanges(mode = 'original') {
                        if (!hasChanges) return;

                        try {
                            const response = await fetch('/api/save-image', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    imagePath: currentImage,
                                    mode: mode
                                })
                            });

                            if (!response.ok) throw new Error('Save failed');

                            const result = await response.json();
                            currentImage = result.newPath;
                            hasChanges = false;
                            showStatus('Changes saved');
                            updateControls();

                        } catch (error) {
                            showStatus('Error saving: ' + error.message, 'error');
                        }
                    }

                    async function moveToDeleted() {
                        try {
                            const response = await fetch('/api/move-to-deleted', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    imagePath: currentImage
                                })
                            });

                            if (!response.ok) throw new Error('Move failed');

                            showStatus('Image moved to deleted folder');
                            return true;

                        } catch (error) {
                            showStatus('Error moving file: ' + error.message, 'error');
                            return false;
                        }
                    }
                </script>
            </head>
            <body>
                <div class="gallery">
                    ${gallery.map(item => `
                        <div class="image-tile" onclick="showFullscreen('file://\${item.original}')">
                            <img src="file://\${item.thumbnail}" alt="Gallery image">
                        </div>
                    `).join('')}
                </div>
                <div id="fullscreenViewer" class="fullscreen-viewer" onclick="hideFullscreen()">
                    <img src="" alt="Full size image" onclick="event.stopPropagation()">
                    <div id="viewerControls" class="viewer-controls"></div>
                    <div id="statusMessage" class="status-message"></div>
                </div>
            </body>
            </html>
        `;
    }

    printProgress() {
        const percent = ((this.stats.processed + this.stats.skipped) / this.stats.total * 100).toFixed(1);
        console.log(`Progress: ${percent}% (${this.stats.processed} processed, ${this.stats.skipped} skipped)`);
    }

    printStats() {
        console.log('\nProcessing Complete:');
        console.log(`Total images found: ${this.stats.total}`);
        console.log(`Successfully processed: ${this.stats.processed}`);
        console.log(`Skipped: ${this.stats.skipped}`);
        console.log(`Errors: ${this.stats.errors}`);
    }
}