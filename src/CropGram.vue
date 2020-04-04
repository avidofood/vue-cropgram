<template>
    <div class="cg-wrapper">
        <div class="cg-content">
            <crop-view
                v-show="showCropper"
                ref="view"
                :view="currentView"
                v-bind="$attrs"
                @update="$emit('update', $event)"
                @image-remove="handleImageRemove"
                @new-image="handleNewImage"
                @file-loaded="handleFileLoaded"
                @move="handleMove"
                @zoom="handleZoom"
                @draw="handleDraw"

                @init="$emit('init')"
                @file-choose="$emit('file-choose')"
                @file-size-exceed="$emit('file-size-exceed')"
                @file-type-mismatch="$emit('file-type-mismatch')"
                @new-image-drawn="$emit('new-image-drawn')"
                @initial-image-loaded="$emit('initial-image-loaded')"
                @loading-start="$emit('loading-start')"
                @loading-end="$emit('loading-end')"
                @image-error="$emit('image-error')"
            />
            <slot />
        </div>

        <crop-selection
            :items="sortedItems"
            :items-limit="itemsLimit"
            :selection-text="selectionText"
            :selection-text-class="selectionTextClass"
            :current-view-id="currentViewId"
            :highest-order="highestOrder"
            @setView="setView"
            @updateItems="setItems($event);hasChanged();"
            @chooseFile="chooseFile"
            @thumbnailError="handleThumbnailError"
        />
    </div>
</template>


<script>

import props from './core/props';
import CropView from './components/view/CropView.vue';
import CropSelection from './components/selection/CropSelection.vue';

import collection from './mixins/collection';
import handleMethods from './mixins/handleMethods';
import handleSaving from './mixins/handleSaving';
import helpers from './mixins/helpers';

export default {
    props,
    mixins: [
        collection,
        handleMethods,
        handleSaving,
        helpers,
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
            valuesChanged: false,
            blockChangeEvent: false, // Important for setView
        };
    },
    mounted() {
        this.items.forEach(
            (item, index) => this.addItem(index + 1, item, {}, item, false),
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
        addItem(order, thumbnail, cropper = {}, url = '', changed = false) {
            this.add({
                order, thumbnail, cropper, url, changed,
            });
        },
        addNewUrl(url) {
            const nextId = this.sortedItemsCount;

            if (!url) return;

            if (this.itemsLimit <= nextId) {
                this.$emit('limit-reached');
                return;
            }

            this.addItem(
                this.highestOrder + 1,
                url,
                {},
                url,
                false,
            );


            this.setViewId(nextId);

            this.updateCurrentView();

            this.$emit('new-image');

            this.hasChanged();
        },
        addNewCropper(cropper) {
            const nextId = this.sortedItemsCount;

            if (!cropper || cropper === {}) return;

            if (this.itemsLimit <= nextId) {
                this.$emit('limit-reached');
                return;
            }


            this.addItem(
                this.highestOrder + 1,
                this.getCurrentCropperThumbnail(),
                cropper,
                '',
                true,
            );


            this.setViewId(nextId);

            this.updateCurrentView();

            this.$emit('new-image');

            this.hasChanged();
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
        setView(id) {
            this.blockChangeEvent = true;

            this.updateCurrentSortedItem();
            this.setViewId(id);
            this.updateCurrentView();

            this.$emit('set-view', id);
        },
        chooseFile() {
            this.cropper.chooseFile();
            this.$emit('choose-file-button');
        },
        getCurrentCropperThumbnail() {
            return this.cropper.generateDataUrl();
        },
        save() {
            return this.createOutputArray();
        },


    },
};
</script>
