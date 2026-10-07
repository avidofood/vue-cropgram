import cropperUrl from '../lib/cropperUrl';

// The cropper adds a cors parameter to the URL with forceCacheBreak
const withoutCacheBreak = (url) => {
    try {
        const parsed = new URL(url, document.baseURI);
        parsed.searchParams.delete('cors');
        return parsed.href;
    } catch (error) {
        return url;
    }
};

export default {
    methods: {
        hasChanged() {
            this.valuesChanged = true;
            this.$emit('has-changed');
        },
        setChanged() {
            const item = this.sortedItem(this.currentViewId);

            if (item) item.changed = true;
        },
        updateCurrentView() {
            this.currentView = this.sortedItem(this.currentViewId);

            // The cropper can show this image already, for example a newly added file, or after
            // a switch back before the other image loaded. Then the stored crop is no restore.
            const item = this.currentView;

            if (item && item.cropper.img && this.cropperShows(item)) {
                this.restoredSrc = item.cropper;
            }
        },
        /**
         * True if the cropper shows the image of this item. While the cropper loads the image of
         * a new view, it still shows the previous image.
         */
        cropperShows(item) {
            if (!item || !this.cropper || !this.cropper.hasImage()) return false;

            const { img } = this.cropper.getMetadata();

            if (item.cropper.img) return img === item.cropper.img;

            return Boolean(item.url)
                && withoutCacheBreak(img.src) === withoutCacheBreak(cropperUrl(item));
        },
        /**
         * True while the cropper shows a stored crop again after a view change. The cropper
         * emits zoom and move for it. The restore ends when the cropper draws the current image.
         */
        isRestoring() {
            const src = this.$refs.view.cropper;

            return src !== null && typeof src === 'object' && src !== this.restoredSrc;
        },
        /**
         * True if a move or a zoom of the cropper is a change by the user. The cropper also emits
         * move and zoom while it loads an image, and when it shows a stored crop again.
         */
        isUserChange() {
            return this.cropperShows(this.sortedItem(this.currentViewId)) && !this.isRestoring();
        },
        /**
         * Stores the crop of the current image. Only if the cropper shows this image,
         * so that no image gets the crop of another one.
         */
        updateCurrentSortedItem() {
            const item = this.sortedItem(this.currentViewId);

            if (this.cropperShows(item)) item.cropper = this.cropper.getMetadata();
        },
    },
};
