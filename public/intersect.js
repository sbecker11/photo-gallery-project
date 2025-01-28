// path: /public/intersect.js
// timestamp: 2025-01-27T19:26:23

// Return the rect intersection between the given
// element and the window if the element is visible.
// Otherwise, return null
export function getElementVisibility(element) {
    // Get the element's bounding client rectangle
    const elementRect = element.getBoundingClientRect();

    // Get the window's dimensions and scroll position
    const windowRect = {
        top: 0 - window.scrollY,
        left: 0 - window.scrollX,
        right: window.innerWidth - window.scrollX,
        bottom: window.innerHeight - window.scrollY
    };

    // Compute the intersection
    const left = Math.max(elementRect.left, windowRect.left);
    const right = Math.min(elementRect.right, windowRect.right);
    const top = Math.max(elementRect.top, windowRect.top);
    const bottom = Math.min(elementRect.bottom, windowRect.bottom);

    // If there's no intersection, width or height will be negative
    if (left < right && top < bottom) {
        return {
            left: left,
            top: top,
            right: right,
            bottom: bottom,
            width: right - left,
            height: bottom - top
        };
    } else {
        // No intersection
        return null;
    }
}

// // Example usage:
// const element = document.getElementById('myElement');
// const intersection = getIntersectionRect(element);

// if (intersection) {
//     console.log('Intersection:', intersection);
// } else {
//     console.log('No intersection');
// }