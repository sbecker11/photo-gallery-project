// path: public/key-events.js
// generated on: 2023-10-10T10:00:00Z
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
        console.log(`Key pressed: ${e.key}`);
        if (e.key === 'f') {
            console.log("f");
            fullSizeImage('fit');
        } else if (e.key === 'F') {
            console.log("F");
            fullSizeImage('fill');
        } else if (e.key === 'd') {
            console.log("d");
            deleteImage();
        } else if (e.key === 'r') {
            console.log("r");
            rotateImage('clockwise');
        } else if (e.key === 'R') {
            console.log("R");
            rotateImage('counterclockwise');
        } else if (e.key === 'h') {
            console.log("h");
            applyHistogramEqualization();
        } else if (e.key === 'g') {
            console.log("g");
            convertToGreyscale();
        } else if (e.metaKey && e.key === 's') {
            console.log("Cmd-S");
            saveChanges('original');
        } else if (e.metaKey && e.key === 'v') {
            console.log("Cmd-V");
            saveChanges('copy');
        } else if (e.key === '?') {
            console.log("?");
            showUsageMessage();
        } else if (e.key === 'Escape') {
            console.log("Escape");
            hideUsageMessage();
            hideFullscreen();
        }
    });
});

function showFullscreen(imagePath) {
    const viewer = document.getElementById('fullscreenViewer');
    const img = viewer.querySelector('img');
    img.src = imagePath;
    viewer.style.display = 'flex';
}

function hideFullscreen() {
    const viewer = document.getElementById('fullscreenViewer');
    viewer.style.display = 'none';
}

function showUsageMessage() {
    const usageMessage = document.getElementById('usageMessage');
    usageMessage.style.display = 'block';
}

function hideUsageMessage() {
    const usageMessage = document.getElementById('usageMessage');
    usageMessage.style.display = 'none';
}

function fullSizeImage(mode) {
    console.log(`Full size image mode: ${mode}`);
    const img = document.getElementById('fullscreenViewer').querySelector('img');
    if (mode === 'fit') {
        img.style.objectFit = 'contain';
    } else if (mode === 'fill') {
        img.style.objectFit = 'cover';
    }
}

function deleteImage() {
    console.log('Delete image functionality not implemented yet.');
    // Implement the logic to move the file to a ".deleted" folder
}

function rotateImage(direction) {
    console.log(`Rotate image ${direction} functionality not implemented yet.`);
    // Implement the logic to rotate the image
}

function applyHistogramEqualization() {
    console.log('Apply histogram equalization functionality not implemented yet.');
    // Implement the logic to apply histogram equalization
}

function convertToGreyscale() {
    console.log('Convert to greyscale functionality not implemented yet.');
    // Implement the logic to convert the image to greyscale
}

function saveChanges(type) {
    console.log(`Save changes to ${type} functionality not implemented yet.`);
    // Implement the logic to save changes to the original or copy file
}