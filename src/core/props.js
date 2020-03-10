export default {
    items: {
        type: Array,
        required: false,
        default: () => [],
    },
    selectionText: {
        type: String,
        default: 'Chosen Images',
    },
    selectionClass: {
        type: String,
        default: '',
    },
};
