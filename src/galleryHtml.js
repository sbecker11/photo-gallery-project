// generated on: 2023-10-10T10:00:00Z
export function generateGalleryHtml(galleryImageSize) {
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
                    grid-template-columns: repeat(auto-fill, minmax(${galleryImageSize}px, 1fr));
                    gap: 20px;
                    padding: 20px;
                }
                .image-tile {
                    position: relative;
                    width: ${galleryImageSize}px;
                    height: ${galleryImageSize}px;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                    cursor: pointer;
                    perspective: 1000px;
                }
                .image-tile img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
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
                .usage-message {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    padding: 20px;
                    border-radius: 10px;
                    color: white;
                    display: none;
                    z-index: 3000;
                }
            </style>
        </head>
        <body>
            <div class="gallery" id="gallery-content">
                <!-- Gallery content will be dynamically loaded here -->
            </div>
            <div id="fullscreenViewer" class="fullscreen-viewer">
                <img src="" alt="Full size image">
            </div>
            <div id="usageMessage" class="usage-message">
                <h2>Usage Instructions</h2>
                <p><strong>?</strong>: Show this usage message</p>
                <p><strong>Escape</strong>: Hide this usage message</p>
                <p><strong>Click on an image</strong>: View the image in full screen</p>
                <p><strong>f</strong>: Full size the image to fit the screen on its longest dimension</p>
                <p><strong>F</strong>: Full size the image to fit the screen on its smallest dimension and crop as needed</p>
                <p><strong>d</strong>: Move the file to a ".deleted" folder, go back to gallery view, and re-render to fill the gap</p>
                <p><strong>r</strong>: Rotate the image clockwise</p>
                <p><strong>R</strong>: Rotate the image counter-clockwise</p>
                <p><strong>h</strong>: Apply histogram equalization</p>
                <p><strong>g</strong>: Convert to greyscale</p>
                <p><strong>Cmd-S</strong>: Save changes to the original image file</p>
                <p><strong>Cmd-V</strong>: Save changes to a copy file with the same name but with "-copy" appended to file root</p>
            </div>
            <script src="key-events.js?v=1.0"></script>
            <script>
                // Load the generated gallery content
                fetch('gallery-content.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('gallery-content').innerHTML = html;
                        // Reinitialize event listeners after loading content
                        const imageTiles = document.querySelectorAll('.image-tile');
                        imageTiles.forEach(tile => {
                            tile.addEventListener('click', () => {
                                const img = tile.querySelector('img');
                                showFullscreen(img.dataset.full);
                            });
                        });
                    });
            </script>
        </body>
        </html>
    `;
}