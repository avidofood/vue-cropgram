export default {
    methods: {
        handleImageRemove() {
            if (this.isSortedItemsEmpty) return;

            const id = this.currentViewId; // save old id

            this.setViewId(this.previousView);

            const order = this.sortedItemOrder(id);

            this.remove(id);

            if (!this.isSortedItemsEmpty) {
                this.recalculateOrder(order);
            }

            this.updateCurrentView();

            this.$emit('image-remove');

            this.hasChanged();
        },
        handleNewImage(newValue) {
            this.addNewCropper(newValue);
        },
        handleFileLoaded() {
            this.$emit('file-loaded');

            if (this.isSortedItemsEmpty) return;

            this.updateCurrentSortedItem();
        },
        handleMove() {
            if (this.blockChangeEvent) return;

            this.$emit('move');
            this.hasChanged();
            this.setChanged();
        },
        handleZoom() {
            if (this.blockChangeEvent) return;

            this.$emit('zoom');
            this.hasChanged();
            this.setChanged();
        },
        handleDraw() {
            this.$emit('draw');
            // resets the blockChangeEvent
            this.blockChangeEvent = false;
        },
        handleThumbnailError(index) {
            this.$emit('thumbnail-error', index);

            // Hmm. How can we improve this part? It's also used in vue-instagram-cropper
            this.sortedItem(index).thumbnail = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 600 600\'%3E%3Cpath fill=\'%23fff\' d=\'M0 0H600V600H0z\'/%3E%3Cpath d=\'M231.17 366.43a15.88 15.88 0 0 1-15.88-15.88v-95.31a15.88 15.88 0 0 1 15.88-15.88h137.66a15.89 15.89 0 0 1 15.89 15.88v95.31a15.89 15.89 0 0 1-15.89 15.88zm2.65-90a18.53 18.53 0 1 0 18.53-18.53 18.52 18.52 0 0 0-18.53 18.52zm129.72 68.83v-37.07l-29-29a4 4 0 0 0-5.62 0l-44.84 44.84-18.33-18.33a4 4 0 0 0-5.62 0l-23.67 23.67v15.88z\' fill=\'%23252525\'/%3E%3Cpath d=\'M169.39 219.53a6.66 6.66 0 0 1-1.17-9.34l8.18-10.52a6.66 6.66 0 0 1 9.35-1.17l244.86 189.25a6.68 6.68 0 0 1 1.17 9.35l-8.18 10.51a6.66 6.66 0 0 1-9.35 1.17z\' fill=\'%23b1605f\'/%3E%3C/svg%3E';
        },
    },
};
