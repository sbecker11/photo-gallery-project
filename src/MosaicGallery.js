// path: src/MosaicGallery.js
// generated on: 2023-10-10T10:00:00Z
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

class MosaicGallery {
    constructor(options = {}) {
        this.width = options.width;
        this.height = options.height;
        this.thumbnailPercentage = options.thumbnailPercentage;
        this.outputPath = options.outputPath;
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

        await fs.ensureDir(this.outputPath);

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

                const { width, height } = await sharp(file).metadata();
                const thumbnailWidth = Math.round(width * this.thumbnailPercentage);
                const thumbnailHeight = Math.round(height * this.thumbnailPercentage);

                const thumbnailPath = path.join(
                    this.outputPath,
                    `thumb_${path.basename(file)}`
                );

                if (!await fs.pathExists(thumbnailPath)) {
                    try {
                        await sharp(file)
                            .resize(thumbnailWidth, thumbnailHeight, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
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
                    original: `/images/${path.relative(process.env.scan_root, file)}`,
                    thumbnail: `/thumbnails/thumb_${path.basename(file)}`
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
        const htmlContent = this.createHtmlContent(gallery);
        const galleryHtmlPath = path.join(path.dirname(outputPath), 'gallery-content.html');
        await fs.writeFile(galleryHtmlPath, htmlContent);
        console.log(`Gallery content written to: ${galleryHtmlPath}`);
    }

    createHtmlContent(gallery) {
        return `
            ${gallery.map(item => `
                <div class="image-tile">
                    <img src="${item.thumbnail}" data-full="${item.original}" alt="Gallery image">
                </div>
            `).join('')}
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

export default MosaicGallery;