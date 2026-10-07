// Texts for screen readers. {index} is the number of the image, starting at 1.
export const defaultLabels = {
    add: 'Add images',
    image: 'Image {index}',
    choose: 'Choose image {index}',
};

export const withIndex = (text, index) => text.replace(/\{index\}/g, String(index + 1));
