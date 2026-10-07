import loadImage from '../lib/loadImage';

export default {
    methods: {
        handleFileInput() {
            const input = this.$refs.files;
            const files = Array.from(input.files);

            // Without this, the same file can not be chosen again
            input.value = '';

            this.addFiles(files);
        },
        /**
         * Checks a file like the cropper does: an image type, and smaller than fileSizeLimit.
         * Emits the same events as the cropper for a file that does not fit.
         */
        isValidFile(file) {
            this.$emit('file-choose', file);

            if (!/^image/.test(file.type)) {
                this.$emit('file-type-mismatch', file);
                return false;
            }

            const limit = this.cropper.fileSizeLimit;

            if (limit && file.size >= limit) {
                this.$emit('file-size-exceed', file);
                return false;
            }

            return true;
        },
        /**
         * The crop of a new image: it fills the canvas and is centered, as the cropper places
         * a chosen file.
         */
        coverCrop(img) {
            const { outputWidth, outputHeight } = this.cropper;
            const scaleRatio = Math.max(
                outputWidth / img.naturalWidth,
                outputHeight / img.naturalHeight,
            );
            const width = img.naturalWidth * scaleRatio;
            const height = img.naturalHeight * scaleRatio;

            return {
                img,
                imgData: {
                    width,
                    height,
                    startX: (outputWidth - width) / 2,
                    startY: (outputHeight - height) / 2,
                },
                scaleRatio,
            };
        },
        /**
         * Adds image files, for example from a file input with multiple or from a drop.
         * Files over itemsLimit are left out. Shows the first new image.
         *
         * @param  {FileList|File[]} files
         * @return {Promise<number>} [The number of added images]
         */
        async addFiles(files) {
            const space = this.itemsLimit - this.sortedItemsCount;
            const valid = Array.from(files).filter(this.isValidFile);

            if (valid.length > space) this.$emit('limit-reached');

            const accepted = valid.slice(0, Math.max(space, 0));
            const loads = await Promise.allSettled(accepted.map(loadImage));

            if (this.isUnmounted) return 0;

            const { outputWidth, outputHeight } = this.cropper;
            const firstId = this.sortedItemsCount;
            let added = 0;

            // Stores the latest crop of the current image before the view changes
            this.updateCurrentSortedItem();

            loads.forEach((load, index) => {
                const file = valid[index];

                // The cropper has no size, for example in a hidden container
                if (load.status === 'rejected' || !(outputWidth > 0 && outputHeight > 0)) {
                    this.$emit('image-error', file);
                    return;
                }

                // Another call can add images while these files load
                if (this.sortedItemsCount >= this.itemsLimit) return;

                const cropper = this.coverCrop(load.value);
                const thumbnail = this.cropper
                    .saving(cropper.img, cropper.imgData, outputWidth, outputHeight)
                    .generateDataUrl();

                this.addItem(this.highestOrder + 1, thumbnail, cropper, '', true);
                added += 1;

                this.$emit('new-image');
                this.hasChanged();
            });

            if (added > 0) {
                this.setViewId(firstId);
                this.updateCurrentView();
            }

            return added;
        },
    },
};
