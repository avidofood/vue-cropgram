<template>
    <div
        class="cg-wrapper"
        :class="$attrs.class"
        :style="$attrs.style"
    >
        <div class="cg-content">
            <crop-view
                v-show="showCropper"
                ref="view"
                v-bind="cropperAttrs()"
                :view="currentView"
                v-on="forwardedListeners"
                @image-remove="handleImageRemove"
                @new-image="handleNewImage"
                @file-loaded="handleFileLoaded"
                @move="handleMove"
                @zoom="handleZoom"
                @draw="handleDraw"
            />
            <slot />
        </div>

        <input
            v-if="multiple"
            ref="files"
            type="file"
            accept="image/*"
            multiple
            class="cg-file-input"
            @change="handleFileInput"
        >

        <crop-selection
            :items="sortedItems"
            :items-limit="itemsLimit"
            :selection-text="selectionText"
            :selection-text-class="selectionTextClass"
            :current-view-id="currentViewId"
            :highest-order="highestOrder"
            @set-view="setView"
            @update-items="updateItems"
            @choose-file="chooseFile"
            @thumbnail-error="handleThumbnailError"
        />
    </div>
</template>

<script>
import props from './core/props';
import emits, { cropperEvents } from './core/events';
import CropView from './components/view/CropView.vue';
import CropSelection from './components/selection/CropSelection.vue';

import collection from './mixins/collection';
import handleFiles from './mixins/handleFiles';
import handleMethods from './mixins/handleMethods';
import handleSaving from './mixins/handleSaving';
import helpers from './mixins/helpers';

export default {
    components: {
        CropView,
        CropSelection,
    },
    mixins: [
        collection,
        handleFiles,
        handleMethods,
        handleSaving,
        helpers,
    ],
    // class and style go to the root element. The other attributes, for example the props
    // of vue-instagram-cropper, go to the cropper.
    inheritAttrs: false,
    props,
    emits,
    data() {
        return {
            currentViewId: -1,
            currentView: null,
            cropper: null,
            valuesChanged: false,
            // The stored crop that the cropper shows again, see isRestoring()
            restoredSrc: null,
            // Gives every item a key, see lib/cropperUrl.js
            nextKey: 0,
            // addFiles() loads files after an await
            isUnmounted: false,
        };
    },
    computed: {
        forwardedListeners() {
            return Object.fromEntries(cropperEvents.map(
                (name) => [name, (...args) => this.$emit(name, ...args)],
            ));
        },
    },
    mounted() {
        this.items.forEach(
            (item, index) => this.addItem(index + 1, item, {}, item, false),
        );
        this.setFirstCurrentView();
        this.updateCurrentView();

        this.cropper = this.$refs.view.$refs.cropper;
    },
    beforeUnmount() {
        this.isUnmounted = true;
    },
    methods: {
        cropperAttrs() {
            return Object.fromEntries(Object.entries(this.$attrs)
                .filter(([key]) => key !== 'class' && key !== 'style'));
        },
        /**
         * Adds a new Image to this.sortedItems
         * @param {Integer} order     [Order of Images]
         * @param {String} thumbnail [Simple Image]
         * @param {Object} cropper    [Contains Infos of the picture]
         * @param {string} url    [The url of the image]
         */
        addItem(order, thumbnail, cropper = {}, url = '', changed = false) {
            this.nextKey += 1;
            this.add({
                key: this.nextKey, order, thumbnail, cropper, url, changed,
            });
        },
        addNewUrl(url) {
            const nextId = this.sortedItemsCount;

            if (!url) return;

            if (this.itemsLimit <= nextId) {
                this.$emit('limit-reached');
                return;
            }

            // Stores the latest crop of the current image before the view changes
            this.updateCurrentSortedItem();

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

            if (!cropper || Object.keys(cropper).length === 0) return;

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
            this.updateCurrentSortedItem();
            this.setViewId(id);
            this.updateCurrentView();

            this.$emit('set-view', id);
        },
        updateItems(list) {
            this.setItems(list);
            this.updateCurrentView();
            this.hasChanged();
        },
        chooseFile() {
            // At the limit, a new file would only replace the current image in the cropper
            if (this.itemsLimit <= this.sortedItemsCount) {
                this.$emit('limit-reached');
                return;
            }

            if (this.multiple) {
                this.$refs.files.click();
            } else {
                this.cropper.chooseFile();
            }

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

<style scoped>
/* Hidden like the file input of the cropper. Some browsers do not open a hidden input. */
.cg-file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    margin-left: -99999px;
}
</style>
