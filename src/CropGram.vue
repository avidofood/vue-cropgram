<template>
    <div class="cg-wrapper">
        <div class="cg-content">
            <crop-view
                ref="view"
                :view="currentView"
                @input="handleImageInput"
                @image-remove="handleImageRemove"
                @new-image-drawn="handleNewImageDrawn"
            />
            <slot />
        </div>

        <crop-selection
            :items="sortedItems"
            :selection-text="selectionText"
            :current-view-id="currentViewId"
            @setView="setView"
            @updateItems="updateItems"
            @chooseFile="chooseFile"
        />
    </div>
</template>


<script>

import props from './core/props';
import CropView from './components/view/CropView.vue';
import CropSelection from './components/selection/CropSelection.vue';

export default {
    props,
    components: {
        CropView,
        CropSelection,
    },
    data() {
        return {
            sortedItems: [],
            currentViewId: -1,
            currentView: null,
            cropper: null,
        };
    },
    mounted() {
        this.items.forEach(
            (item, index) => this.addItem(index + 1, item, {}, item, null),
        );
        this.setFirstCurrentView();
        this.updateCurrentView();

        this.cropper = this.$refs.view.$refs.cropper;
    },
    methods: {
        /**
		 * Adds a new Image to this.sortedItems
		 * @param {Integer} order     [Order of Images]
		 * @param {String} thumbnail [Simple Image]
		 * @param {Object} cropper    [Contains Infos of the picture]
         * @param {string} url    [The url of the image]
		 */
        addItem(order, thumbnail, cropper = {}, url = '') {
            this.sortedItems.push({
                order, thumbnail, cropper, url,
            });
        },
        setViewId(index) {
            this.currentViewId = index;
        },
        setFirstCurrentView() {
            if (this.isSortedItemsEmpty) {
                this.setViewId(-1);
                return;
            }
            this.setViewId(0);
        },
        handleNewImageDrawn() {
            console.log('handleNewImageDrawn');
        },
        handleImageRemove() {
            console.log('handleImageRemove');
        },
        // handleNewImage() {
        //     console.log('handleNewImage');

        //     const obj = this.cropper.getMetadata();
        //     this.addItem(this.sortedItems.length + 1, 'blubb', obj.cropper, '');
        //     this.setViewId(this.sortedItems.length);
        //     //     this.updateCurrentView();
        // },
        handleImageInput(newValue) {
            /** Also was muss ich tun:
             * Start Bild anzeigen
             * Aber auch ohne Start Bild funktionieren können
             * Wir müssen Einfach auf die ganzen Sachen hören und es trennen
             * */

            console.log('handleImageInput');
            // if (!newValue) {
            //     if (!this.newImage) {
            //         this.sortedItems = [];
            //     }
            //     this.setFirstCurrentView();
            //     this.updateCurrentView();
            //     return;
            // }

            // if (this.isSortedItemsEmpty) {
            //     this.addItem(1, 'blubb', newValue.cropper, newValue.url);
            //     this.setFirstCurrentView();
            //     this.updateCurrentView();
            //     this.newImage = false;
            //     return;
            // }

            // if (this.newImage) {
            //     this.addItem(this.sortedItems.length + 1, 'blubb', newValue.cropper, newValue.url);
            //     this.setViewId(this.sortedItems.length);
            //     this.updateCurrentView();
            //     this.newImage = false;
            //     return;
            // }

            // this.sortedItems[this.currentViewId] = { ...this.sortedItems[this.currentViewId], ...newValue };
            // this.updateCurrentView();
            // this.newImage = true;
        },
        updateCurrentView() {
            this.currentView = this.sortedItems[this.currentViewId];
        },
        updateItems(list) {
            this.sortedItems = list;
        },
        setView() {
            console.log('setView');
        },
        chooseFile() {
            this.cropper.chooseFile();
        },
    },
    computed: {
        isSortedItemsEmpty() {
            return this.sortedItems.length === 0;
        },
    },
};
</script>
