export default {
    methods: {
        handleImageRemove() {
            if (this.isSortedItemsEmpty) return;

            const id = this.currentViewId; // save old id

            this.setViewId(this.currentViewId - 1);

            const order = this.sortedItemOrder(id);

            this.remove(id);

            if (!this.isSortedItemsEmpty) {
                this.recalculateOrder(order);
            }

            this.updateCurrentView();

            this.$emit('image-remove');
        },
        handleNewImage(newValue) {
            const nextId = this.sortedItemsCount;

            this.addItem(
                this.highestOrder + 1,
                this.getCurrentCropperThumbnail(),
                newValue,
            );

            this.setViewId(nextId);

            this.updateCurrentView();

            this.$emit('new-image');
        },
        handleFileLoaded() {
            this.$emit('file-loaded');

            if (this.isSortedItemsEmpty) return;

            this.updateCurrentSortedItem();
        },
    },
};
