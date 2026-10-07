export default {
    methods: {
        /**
         * The result of save(): the chosen images in their order.
         *    1. filter() keeps the chosen images (order 0 means not chosen)
         *    2. sort() sorts them by order
         *    3. filter() removes images without a result (shouldn't be there..)
         *    4. map() gives { url } for an unchanged image of the items prop, else { blob }
         *
         * @return {Promise<Array>}
         */
        createOutputArray() {
            return Promise.all(this.sortedItems
                .filter((item) => item.order > 0)
                .sort(this.sortByOrder)
                .filter(this.filterErrors)
                .map(this.mapArrayForOutput));
        },
        sortByOrder(a, b) {
            if (a.order > b.order) return 1;
            if (a.order < b.order) return -1;
            return 0;
        },
        /**
         * The crop of an image. The cropper has the latest crop of the current image.
         * The stored crop of the current image can be older (#6).
         *
         * @return {Object} [The metadata of the cropper, or {} if there is none]
         */
        cropDataOf(item) {
            const isCurrent = item === this.sortedItem(this.currentViewId);

            // While the cropper loads the image of a new view, it still shows the previous image
            if (isCurrent && this.cropperShows(item)) {
                return this.cropper.getMetadata();
            }

            return item.cropper;
        },
        filterErrors(item) {
            // An unchanged image gives its URL
            if (!item.changed) return Boolean(item.url);

            // A changed image needs a crop
            return Boolean(this.cropDataOf(item).img);
        },
        mapArrayForOutput(item) {
            if (!item.changed) {
                return { url: item.url };
            }

            const { img, imgData } = this.cropDataOf(item);
            const { outputWidth, outputHeight } = this.cropper;

            return this.cropper.saving(img, imgData, outputWidth, outputHeight)
                .promisedBlob(this.mimeType, this.compression)
                .then((blob) => {
                    // canvas.toBlob() gives null, for example for a canvas without a size
                    if (!blob) throw new Error('vue-cropgram: the browser could not create the image');

                    return { blob };
                });
        },
    },
};
