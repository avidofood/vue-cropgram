import { defineComponent, h } from 'vue';

// The events of vue-instagram-cropper
export const events = [
    'init', 'file-choose', 'file-size-exceed', 'file-type-mismatch', 'file-loaded', 'new-image',
    'new-image-drawn', 'image-error', 'image-remove', 'image-remove-onload', 'move', 'zoom', 'draw',
    'initial-image-loaded', 'loading-start', 'loading-end', 'update', 'input',
];

// A real image element. JSON.stringify() turns it into {}, like in the browser.
// An image from a URL has that URL as src, like in the real cropper.
export const createImage = (name, src) => {
    const img = document.createElement('img');
    img.dataset.name = name;
    if (src) img.src = src;
    return img;
};

/**
 * Stands in for vue-instagram-cropper in the unit tests. It has the methods and the properties
 * that CropGram uses. It shows an image as soon as the src prop changes.
 */
export default defineComponent({
    name: 'InstagramCropper',
    props: {
        src: {
            type: [Object, String],
            required: false,
        },
    },
    emits: events,
    data() {
        return {
            img: null,
            imgData: {
                width: 0, height: 0, startX: 0, startY: 0,
            },
            outputWidth: 600,
            outputHeight: 600,
            chooseFileCalls: 0,
            // Set it to false to keep the old image until finishLoad(), like a slow network
            instantLoad: true,
            pendingSrc: null,
        };
    },
    watch: {
        src: {
            handler(src) {
                this.pendingSrc = src;
                if (this.instantLoad) this.finishLoad();
            },
            immediate: true,
        },
    },
    methods: {
        // Test helper: shows the image of the src prop, then draws it like the real cropper
        finishLoad() {
            const src = this.pendingSrc;

            if (typeof src === 'string') {
                // CropGram gives an absolute URL with a fragment. The name is the path.
                this.img = createImage(new URL(src).pathname, src);
                this.imgData = {
                    width: 600, height: 600, startX: 0, startY: 0,
                };
            } else if (src) {
                // Like the real cropper: a new width of the image emits zoom before the drawing.
                // The same image with the same crop does not draw again.
                const zoomed = src.imgData.width !== this.imgData.width;
                const imageChanged = src.img !== this.img;
                this.img = src.img;
                this.imgData = { ...src.imgData };
                if (zoomed) this.$emit('zoom');
                if (zoomed || imageChanged) this.$emit('draw');
                return;
            } else {
                this.img = null;
                return;
            }

            this.$emit('draw');
        },
        hasImage() {
            return this.img !== null;
        },
        chooseFile() {
            this.chooseFileCalls += 1;
        },
        getMetadata() {
            return { img: this.img, imgData: { ...this.imgData }, scaleRatio: 1 };
        },
        generateDataUrl() {
            return `data:image/png;name=${this.img ? this.img.dataset.name : ''}`;
        },
        // The blob describes its input, so tests can check what CropGram saved
        saving(img, imgData, outputWidth, outputHeight) {
            return {
                // Like canvas.toBlob(), it gives null for a canvas without a size
                promisedBlob: (mimeType, compression) => {
                    if (outputWidth === 0) return Promise.resolve(null);

                    return Promise.resolve(Object.assign(
                        new Blob(['image'], { type: mimeType }),
                        {
                            img, imgData, outputWidth, outputHeight, compression,
                        },
                    ));
                },
            };
        },
        promisedBlob(...args) {
            return this.saving(this.img, this.imgData, this.outputWidth, this.outputHeight)
                .promisedBlob(...args);
        },
        // Test helper: the user chose a file, and the cropper loaded it
        loadFile(name) {
            this.$emit('file-choose', { name });
            this.$emit('file-loaded');
            this.img = createImage(name);
            this.imgData = {
                width: 600, height: 400, startX: 0, startY: 100,
            };
            this.$emit('draw');
            this.$emit('loading-end');
        },
        // Test helper: the user clicked the remove button of the cropper
        removeImage() {
            this.img = null;
            this.imgData = {
                width: 0, height: 0, startX: 0, startY: 0,
            };
            this.$emit('image-remove');
        },
        // Test helper: the user zoomed in
        zoomIn() {
            this.imgData = { ...this.imgData, width: this.imgData.width * 1.1 };
            this.$emit('zoom');
            this.$emit('draw');
        },
        // Test helper: the user dragged the image
        drag(x) {
            this.imgData = { ...this.imgData, startX: this.imgData.startX + x };
            this.$emit('move');
            this.$emit('draw');
        },
    },
    render() {
        return h('div', { class: 'cropper-container' });
    },
});
