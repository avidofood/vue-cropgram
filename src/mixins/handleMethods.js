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
    },
};
