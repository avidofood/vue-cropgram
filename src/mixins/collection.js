export default {
    data() {
        return {
            sortedItems: [],
        };
    },
    methods: {
        add(item) {
            this.sortedItems.push(item);
        },
        remove(index) {
            this.sortedItems.splice(index, 1);
        },
        /**
		 * After removing a picture, we need to recalculate the order!
		 *
		 * @param  {Integer} lastOrder
		 * [It's the order number that is missing. Everything after that is going to be decreased]
		 */
        recalculateOrder(lastOrder) {
            this.sortedItems.forEach((item, index) => {
                this.sortedItems[index].order = item.order > lastOrder ? item.order - 1 : item.order;
            });
        },
        sortedItem(id) {
            return this.sortedItems[id];
        },
        sortedItemOrder(id) {
            return this.sortedItem(id).order;
        },
        setItems(list) {
            this.sortedItems = list;
        },
        resetCollection() {
            this.sortedItems = [];
        },
    },
    computed: {
        isSortedItemsEmpty() {
            return this.sortedItemsCount === 0;
        },
        sortedItemsCount() {
            return this.sortedItems.length;
        },
        /**
		 * That gives me all the time the highest order
		 * of all pictures :)
		 *
		 * @return {integer}
		 */
        highestOrder() {
            let order = 0;

            this.sortedItems.forEach((item) => {
                order = item.order > order ? item.order : order;
            });

            return order;
        },
        /**
         * Used when removing an image. To set a new view.
         *
         * @return  {integer}  [Previous index, or if not, next index or -1]
         */
        previousView() {
            if (this.isSortedItemsEmpty || this.sortedItemsCount === 1) return -1;

            if (this.sortedItemsCount > 1 && this.currentViewId === 0) return 0;

            return this.currentViewId - 1;
        },
    },
};
