export default {
    methods: {
        /**
		 * It sorts the array out.
		 *    1. Slice(0) creates a new array.
		 *    2. sort() sorts the array by order
		 *    3. filter() filters the 0 order out (not chosen)
         *    4. filter() filters the errors (shouldn't be there..)
		 *    5. map() our array need to have the format: 'image' or 'url'
		 *
		 * @return {Promise}
		 */
        createOutputArray() {
            return Promise.all(this.sortedItems.slice(0)
                		.sort(this.sortByOrder)
                		.filter((item) => item.order > 0)
                		.filter(this.filterErrors)
				  		.map(this.mapArrayForOutput));
        },
        sortByOrder(a, b) {
            if (a.order > b.order) return 1;
            if (a.order < b.order) return -1;
            return 0;
        },
        filterErrors(item) {
            // Error when URL or Cropper is not set, when no change
            if (!item.changed && (!item.url || Object.keys(item.cropper).length !== 0)) return false;

            // IMPORTANT: Not an error, when changed is set, but cropper empty.
            // This means we need to get the cropper data
            // if (item.changed && Object.keys(item.cropper).length === 0) return false;

            return true;
        },
        mapArrayForOutput(item) {
            if (!item.changed && item.url) {
                return { url: item.url };
            }

            if (Object.keys(item.cropper).length === 0) {
                // Create blob from current canvas.
                return { blob: this.cropper.promisedBlob(this.mimeType, this.compression) };
            }

            // Recreate blob from sortedItems
            const { img, imgData } = item.cropper;
            const { outputWidth, outputHeight } = this.cropper;

            return this.cropper.saving(img, imgData, outputWidth, outputHeight)
                .promisedBlob(this.mimeType, this.compression)
                .then((blob) => ({ blob }));
        },
    },
};
