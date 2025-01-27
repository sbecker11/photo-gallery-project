
// initializeGallery
// 0. identify scaled thumbnail cache folder
// 1. scan for all full-sized images
// 2. for each full-sized image find scaled thumbnail in thumbnail cache folder
// 3. if scaled thumbnail not found or is older than full-sizd image then
//        generate new scaled thumbnail and save in thumbnail cache
// 4. for all scaled thumbnails, keep track of:
//        a. properties used for sorting including:
//            full-sized image last modified date
//            scaled-thumbnail last modified data
//            full-size image bytes
//            full-size image dimensions
//        b. server-side path of scaled thumbnail
//        c. client-side URL of scaled thumbnail
//        d. server-side path of full-sized image
//        e. client-side URL of full-sized image
// 5. sort all thumbnails according to sort criteria
//        default sort by full-size image last modified date increasing/
//        other sort criteria to be determined
// 6.  reset gallery.html body with:
//        HTML of sorted thumbnail URLs contained within gallery image sizeed squares
//        link to open full-sized image URL in detail view

