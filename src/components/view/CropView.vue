<template>
    <form
        class="cp-view"
        style="width: 300px; height: 300px;"
        method="POST"
        enctype="multipart/form-data"
    >
        <instagram-cropper
            ref="cropper"
            placeholder-color="#000000"
            placeholder="Choose or Drag'n'Drop an image"
            :src="cropper"
            :placeholder-font-size="14"
            @update="$emit('update', $event)"
            @image-remove="$emit('image-remove')"
            @file-loaded="handleFileLoaded"
            @loading-end="handleLoadingEnd"
        />
    </form>
</template>

<script>
import InstagramCropper from '/Users/shadrix/Dropbox/Business/Github/Packages/vue-instagram-cropper/src/index';

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
            this.$refs.cropper.img = null; // small hack
        },
        /**
         * From this point on the image is fully loaded, and we can update the metadata
         */
        handleLoadingEnd() {
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
