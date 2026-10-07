// Events of the cropper that CropGram emits again with the same arguments
export const cropperEvents = [
    'update',
    'init',
    'file-choose',
    'file-size-exceed',
    'file-type-mismatch',
    'new-image-drawn',
    'initial-image-loaded',
    'loading-start',
    'loading-end',
    'image-error',
];

// Events of the cropper that CropGram handles first
export const handledCropperEvents = [
    'image-remove',
    'file-loaded',
    'move',
    'zoom',
    'draw',
];

// Events of CropGram itself
export const ownEvents = [
    'new-image',
    'set-view',
    'choose-file-button',
    'limit-reached',
    'has-changed',
    'thumbnail-error',
];

export default [...cropperEvents, ...handledCropperEvents, ...ownEvents];
