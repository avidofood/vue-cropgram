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
    selectionText: {
        type: String,
        default: 'Chosen Images',
    },
    selectionTextClass: {
        type: String,
        default: '',
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
