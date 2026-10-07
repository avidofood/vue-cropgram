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
        updateCurrentSortedItem() {
            const item = this.sortedItem(this.currentViewId);

            if (item) item.cropper = this.cropper.getMetadata();
        },
    },
};
