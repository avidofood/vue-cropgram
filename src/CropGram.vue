<template>
    <div class="cg-wrapper">
        <div class="cg-content">
            <crop-view
                ref="view"
                :view="currentView"
                @image-remove="handleImageRemove"
                @new-image="handleNewImage"
                @file-loaded="handleFileLoaded"
            />
            <slot />
        </div>

        <crop-selection
            :items="sortedItems"
            :selection-text="selectionText"
            :current-view-id="currentViewId"
            :highest-order="highestOrder"
            @setView="setView"
            @updateItems="setItems"
            @chooseFile="chooseFile"
        />
    </div>
</template>


<script>

import props from './core/props';
import CropView from './components/view/CropView.vue';
import CropSelection from './components/selection/CropSelection.vue';

import collection from './mixins/collection';
import handleMethods from './mixins/handleMethods';

export default {
    props,
    mixins: [
        collection,
        handleMethods,
    ],
    components: {
        CropView,
        CropSelection,
    },
    data() {
        return {
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
            this.add({
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
        updateCurrentView() {
            this.currentView = this.sortedItem(this.currentViewId);
        },
        updateCurrentSortedItem() {
            this.sortedItem(this.currentViewId).cropper = this.cropper.getMetadata();
        },
        setView(id) {
            this.updateCurrentSortedItem();
            this.setViewId(id);
            this.updateCurrentView();
        },
        chooseFile() {
            this.cropper.chooseFile();
        },
        getCurrentCropperThumbnail() {
            return this.cropper.generateDataUrl();
        },


    },
};
</script>
