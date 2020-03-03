export default {
    methods: {
        handleImageRemove() {
            if (this.isSortedItemsEmpty) return;

            const id = this.currentViewId; // save old id

            this.setViewId(this.currentViewId - 1);

            this.remove(id);

            if (!this.isSortedItemsEmpty) {
                this.recalculateOrder(this.sortedItemOrder(id));
            }

            this.updateCurrentView();
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
        },
        handleFileLoaded() {
            if (this.isSortedItemsEmpty) return;

            this.updateCurrentSortedItem();
        },
    },
};
