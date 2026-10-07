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
            @new-image-drawn="handleNewImageDrawn"
        />
    </form>
</template>

<script>
import InstagramCropper from 'vue-instagram-cropper';
import { cropperEvents, handledCropperEvents } from '../../core/events';
import cropperUrl from '../../lib/cropperUrl';

// CropView handles these events itself
const ownHandlers = ['file-loaded', 'loading-end', 'new-image-drawn'];

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
            // True from a reload of the same src until the cropper shows the new image
            reloading: false,
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
        // Not deep: CropGram stores the crop of the current image in the same item. Sending that
        // crop to the cropper again would reload the image and can replace a newly chosen file.
        view: {
            handler(val, oldVal) {
                this.convertCropper(val, oldVal);
            },
            immediate: true,
        },
    },
    methods: {
        convertCropper(val, oldVal) {
            this.reloading = false;

            if (!val) {
                this.cropper = null;
                return;
            }

            if (Object.entries(val.cropper).length === 0 && val.cropper.constructor === Object) {
                const src = cropperUrl(val);

                // Another item with the same src, for example the same URL with a fragment twice.
                // The cropper loads only a new src, so it gets null first. Its debounce of
                // 30 ms then loads the URL once.
                if (src === this.cropper && oldVal && oldVal.key !== val.key) {
                    // Until then, the cropper still shows the image of the other item
                    this.reloading = true;
                    this.cropper = null;
                    this.$nextTick(() => {
                        if (this.view === val) this.cropper = src;
                    });
                    return;
                }

                this.cropper = src;
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
        /**
         * The cropper shows a newly loaded image, or the error image after a failed load.
         * A reload is complete. On image-error, the cropper still shows the previous image.
         */
        handleNewImageDrawn(...args) {
            this.reloading = false;
            this.$emit('new-image-drawn', ...args);
        },
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
