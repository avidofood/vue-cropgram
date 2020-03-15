export default {
    methods: {
        hasChanged() {
            this.valuesChanged = true;
            this.$emit('has-changed');
        },
        setChanged() {
            this.sortedItem(this.currentViewId).changed = true;
        },
        updateCurrentView() {
            this.currentView = this.sortedItem(this.currentViewId);
        },
        updateCurrentSortedItem() {
            this.sortedItem(this.currentViewId).cropper = this.cropper.getMetadata();
        },
    },
};
