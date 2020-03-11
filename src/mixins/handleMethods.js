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
    },
};
