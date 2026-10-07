export default {
    showCropper: {
        type: Boolean,
        default: true,
    },
    items: {
        type: Array,
        required: false,
        default: () => [],
    },
    mimeType: {
        type: String,
        default: 'image/jpeg',
    },
    compression: {
        type: Number,
        default: 0.8,
    },
    selectionText: {
        type: String,
        default: 'Chosen Images',
    },
    selectionTextClass: {
        type: String,
        default: '',
    },
    // The add button and chooseFile() let the user choose several files at once
    multiple: {
        type: Boolean,
        default: false,
    },
    itemsLimit: {
        type: Number,
        default: 4,
        note: 'Maximum of images',
        validator(val) {
            return val >= 0;
        },
    },
};
