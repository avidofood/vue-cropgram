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
            :value="cropper"
            :placeholder-font-size="14"
            @input="$emit('input', $event)"
            @image-remove="$emit('image-remove')"
            @new-image-drawn="$emit('new-image-drawn')"
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
                this.cropper = {
                    url: val.url,
                };
                return;
            }

            this.cropper = val;
        },
    },
};
</script>

<style lang="scss" scoped>
    .cp-view .cropper-container{
        height: 100%;
    }
</style>
