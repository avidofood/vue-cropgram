// Texts for screen readers. {index} is the number of the image, starting at 1.
// {order} is the place of a chosen image in the result of save().
export const defaultLabels = {
    add: 'Add images',
    image: 'Image {index}',
    choose: 'Choose image {index}',
    position: 'Number {order}',
};

export const withIndex = (text, index) => text.replace(/\{index\}/g, String(index + 1));

export const withOrder = (text, order) => text.replace(/\{order\}/g, String(order));
