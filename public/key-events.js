// path: /public/key-events.js
// timestamp: 2025-01-23T02:45:00Z

document.addEventListener('DOMContentLoaded', () => {
    const imageTiles = document.querySelectorAll('.image-tile');
    imageTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const img = tile.querySelector('img');
            showFullscreen(img.dataset.full);
        });
    });

    const viewer = document.getElementById('fullscreenViewer');
    viewer.addEventListener('click', hideFullscreen);

    document.addEventListener('keydown', (e) => {
        if (e.metaKey && e.key === 's') {
            e.preventDefault(); // Prevent default browser behavior for Cmd-S
            saveChanges('original');
        } else if (e.metaKey && e.key === 'v') {
            e.preventDefault(); // Prevent default browser behavior for Cmd-V
            saveChanges('copy');
        } else if (e.key === '?') {
            showUsageMessage();
        } else if (e.key === 'Escape') {
            hideUsageMessage();
            hideFullscreen();
        } else if (e.key === 'f') {
            fullSizeImage('fit');
        } else if (e.key === 'F') {
            fullSizeImage('fill');
        } else if (e.key === 'd') {
            deleteImage();
        } else if (e.key === 'r') {
            rotateImage('clockwise');
        } else if (e.key === 'R') {
            rotateImage('counterclockwise');
        } else if (e.key === 'h') {
            applyHistogramEqualization();
        } else if (e.key === 'g') {
            convertToGreyscale();
        }
    });

    function showFullscreen(imagePath) {
        const detailView = document.getElementById('fullscreenViewer');
        const detailImage = detailView.querySelector('img');
        detailImage.src = imagePath;
        detailView.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function hideFullscreen() {
        const detailView = document.getElementById('fullscreenViewer');
        detailView.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    function showUsageMessage() {
        // console.log('Show usage message functionality not implemented yet.');
        // Implement the logic to show usage message
    }

    function hideUsageMessage() {
        // console.log('Hide usage message functionality not implemented yet.');
        // Implement the logic to hide usage message
    }

    function fullSizeImage(mode) {
        const img = document.getElementById('fullscreenViewer').querySelector('img');
        if (mode === 'fit') {
            img.style.objectFit = 'contain';
        } else if (mode === 'fill') {
            img.style.objectFit = 'cover';
        }
    }

    function deleteImage() {
        // console.log('Delete image functionality not implemented yet.');
        // Implement the logic to move the file to a ".deleted" folder
    }

    function rotateImage(direction) {
        const img = document.getElementById('fullscreenViewer').querySelector('img');
        let currentRotation = img.dataset.rotation ? parseInt(img.dataset.rotation) : 0;
        if (direction === 'clockwise') {
            currentRotation += 90;
        } else if (direction === 'counterclockwise') {
            currentRotation -= 90;
        }
        img.style.transform = `rotate(${currentRotation}deg)`;
        img.dataset.rotation = currentRotation;
    }

    function applyHistogramEqualization() {
        // console.log('Apply histogram equalization functionality not implemented yet.');
        // Implement the logic to apply histogram equalization
    }

    function convertToGreyscale() {
        // console.log('Convert to greyscale functionality not implemented yet.');
        // Implement the logic to convert to greyscale
    }

    function saveChanges(type) {
        const img = document.getElementById('fullscreenViewer').querySelector('img');
        const imagePath = new URL(img.src).pathname; // Get the relative path
        const rotation = img.dataset.rotation ? parseInt(img.dataset.rotation) : 0;

        // Implement the logic to save changes to the original or copy file
        // console.log(`Saving changes to ${type} file: ${imagePath} with rotation: ${rotation}`);

        // Example of sending a request to the server to save changes
        fetch('/save-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imagePath: imagePath,
                rotation: rotation,
                type: type
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log('Save response:', data);
            alert(`Original image was saved to: ${data.deletedFilePath}\nUpdated image saved to: ${data.outputPath}`);
            hideFullscreen();
            refreshGallery();
        })
        .catch(error => {
            console.error('Error saving image:', error);
        });
    }

    function refreshGallery() {
        // console.log('key-events:refreshGallery fetching /thumbnails/gallery-content.html')
        fetch('/thumbnails/gallery-content.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('gallery-content').innerHTML = html;
                addThumbnailClickHandlers();
            })
            .catch(error => {
                console.error('Error refreshing gallery:', error);
            });
    }
});