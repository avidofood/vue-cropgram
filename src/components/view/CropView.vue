<template>
    <form
        class="cp-view"
        method="POST"
        enctype="multipart/form-data"
        @submit.prevent
    >
        <instagram-cropper
            ref="cropper"
            v-bind="$attrs"
            :src="cropper"
            v-on="forwardedListeners"
            @file-loaded="handleFileLoaded"
            @loading-end="handleLoadingEnd"
        />
    </form>
</template>

<script>
import InstagramCropper from 'vue-instagram-cropper';
import { cropperEvents, handledCropperEvents } from '../../core/events';

// CropView handles these two events itself
const ownHandlers = ['file-loaded', 'loading-end'];

const forwardedEvents = [...cropperEvents, ...handledCropperEvents]
    .filter((name) => !ownHandlers.includes(name));

export default {
    components: {
        InstagramCropper,
    },
    // The props of the cropper and the listeners of the user go to the cropper, not to the form
    inheritAttrs: false,
    props: {
        view: {
            validator(val) {
                return val === undefined || (val != null && val.constructor.name === 'Object');
            },
            required: false,
        },
    },
    // All events are declared. Otherwise Vue 3 also gives the listeners of CropGram to the
    // cropper through $attrs, and CropGram gets each event twice.
    emits: [...forwardedEvents, ...ownHandlers, 'new-image'],
    data() {
        return {
            cropper: null,
            readSuccesfully: false,
        };
    },
    computed: {
        forwardedListeners() {
            return Object.fromEntries(forwardedEvents.map(
                (name) => [name, (...args) => this.$emit(name, ...args)],
            ));
        },
    },
    watch: {
        view: {
            handler(val) {
                this.convertCropper(val);
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        convertCropper(val) {
            if (!val) {
                this.cropper = null;
                return;
            }

            if (Object.entries(val.cropper).length === 0 && val.cropper.constructor === Object) {
                this.cropper = val.url;
                return;
            }

            this.cropper = val.cropper;
        },
        /**
         * From this point on time we know that the image onload was successfull.
         * We need don't want to fire the remove function, when we use the _onNewFileIn method.
         * So we need to remove the img.
         */
        handleFileLoaded(...args) {
            this.$emit('file-loaded', ...args);
            this.readSuccesfully = true;
        },
        /**
         * From this point on the image is fully loaded, and we can update the metadata
         */
        handleLoadingEnd(...args) {
            this.$emit('loading-end', ...args);

            if (!this.readSuccesfully) return;

            this.readSuccesfully = false;
            this.$emit('new-image', this.$refs.cropper.getMetadata());
        },
    },
};
</script>

<style scoped>
.cp-view .cropper-container {
    height: 100%;
}
</style>
