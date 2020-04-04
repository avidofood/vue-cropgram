<template>
    <form
        class="cp-view"
        method="POST"
        enctype="multipart/form-data"
        @submit.prevent
    >
        <instagram-cropper
            ref="cropper"
            :src="cropper"
            v-bind="$attrs"
            @update="$emit('update', $event)"
            @file-loaded="handleFileLoaded"
            @loading-end="handleLoadingEnd"

            @init="$emit('init')"
            @file-choose="$emit('file-choose')"
            @file-size-exceed="$emit('file-size-exceed')"
            @file-type-mismatch="$emit('file-type-mismatch')"
            @new-image-drawn="$emit('new-image-drawn')"
            @image-remove="$emit('image-remove')"
            @image-error="$emit('image-error')"
            @move="$emit('move')"
            @zoom="$emit('zoom')"
            @draw="$emit('draw')"
            @initial-image-loaded="$emit('initial-image-loaded')"
            @loading-start="$emit('loading-start')"
        />
    </form>
</template>

<script>
import InstagramCropper from 'vue-instagram-cropper';

export default {
    props: {
        view: {
            validator(val) {
                return val === undefined || (val != null && val.constructor.name === 'Object');
            },
            required: false,
        },
    },
    components: {
        InstagramCropper,
    },
    data() {
        return {
            cropper: null,
            readSuccesfully: false,
        };
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
        handleFileLoaded() {
            this.$emit('file-loaded');
            this.readSuccesfully = true;
        },
        /**
         * From this point on the image is fully loaded, and we can update the metadata
         */
        handleLoadingEnd() {
            this.$emit('loading-end');

            if (!this.readSuccesfully) return;

            this.readSuccesfully = false;
            this.$emit('new-image', this.$refs.cropper.getMetadata());
        },
    },
};
</script>

<style lang="scss" scoped>
    .cp-view .cropper-container{
        height: 100%;
    }
</style>
