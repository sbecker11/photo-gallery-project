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
        if (e.key === '?') {
            showUsageMessage();
        } else if (e.key === 'Escape') {
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