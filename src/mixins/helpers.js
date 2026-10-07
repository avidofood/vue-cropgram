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

// Canvas pixels. The cropper calculates the size again from the scale, with rounding errors.
const TOLERANCE = 0.01;

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
        },
        /**
         * True if the cropper shows the image of this item. While the cropper loads the image of
         * a new view, it still shows the previous image.
         */
        cropperShows(item) {
            if (!item || !this.cropper.hasImage()) return false;

            const { img } = this.cropper.getMetadata();

            if (item.cropper.img) return img === item.cropper.img;

            return Boolean(item.url) && withoutCacheBreak(img.src) === withoutCacheBreak(item.url);
        },
        /**
         * True if a move or a zoom of the cropper is a change by the user. The cropper also emits
         * move and zoom while it loads an image, and when it shows a stored crop again.
         */
        isUserChange() {
            const item = this.sortedItem(this.currentViewId);

            if (!this.cropperShows(item)) return false;

            const stored = item.cropper.imgData;

            if (!stored) return true;

            const { imgData } = this.cropper.getMetadata();

            return ['width', 'height', 'startX', 'startY']
                .some((key) => Math.abs(imgData[key] - stored[key]) > TOLERANCE);
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
