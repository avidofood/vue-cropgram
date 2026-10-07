import type {
    ComponentOptionsMixin, DefineComponent, Plugin as VuePlugin, PropType,
} from 'vue';

/** An image in the result of `save()`. */
export type CropGramResult =
    /** An unchanged image of the `items` prop. */
    | { url: string; blob?: undefined }
    /** A chosen file, or an image that you moved or zoomed. */
    | { blob: Blob; url?: undefined };

/** The state of the cropper for one image. The `update` event carries it. */
export interface CropGramCropData {
    img: HTMLImageElement | null;
    imgData: {
        width: number;
        height: number;
        startX: number;
        startY: number;
    };
    scaleRatio: number | null;
}

export interface CropGramProps {
    /** Shows the cropper. With `false`, the selection stays visible. Default: true. */
    showCropper?: boolean;
    /** URLs of the images to start with. CropGram reads them once, when it mounts. */
    items?: string[];
    /** The image type of the blobs from `save()`. Default: 'image/jpeg'. */
    mimeType?: string;
    /** The quality of the blobs from `save()`, from 0 to 1. Default: 0.8. */
    compression?: number;
    /** The text above the thumbnails. Default: 'Chosen Images'. */
    selectionText?: string;
    /** CSS classes for the text above the thumbnails. Default: ''. */
    selectionTextClass?: string;
    /** The maximum number of images. Default: 4. */
    itemsLimit?: number;
}

/**
 * Props of vue-instagram-cropper. CropGram gives them to the cropper.
 * See https://github.com/avidofood/vue-instagram-cropper for the details.
 */
export interface CropGramCropperProps {
    /** Pixels of the canvas for each CSS pixel. Default: 2. */
    quality?: number;
    /** Default: '#F7F7F7'. */
    canvasColor?: string;
    /** Default: 'Choose an image'. */
    placeholder?: string;
    /** Default: '#67ACFD'. */
    placeholderColor?: string;
    /** In CSS pixels. 0 sets the size from the text length. Default: 0. */
    placeholderFontSize?: number;
    /** The maximum file size in bytes. 0 means no limit. Default: 0. */
    fileSizeLimit?: number;
    /** Adds a query parameter to image URLs, against cached responses without CORS headers. */
    forceCacheBreak?: boolean;
    /** Keeps the image over the whole canvas. Default: false. */
    preventWhiteSpace?: boolean;
}

export type CropGramMethods = {
    /** The chosen images in their order. Rejects if the browser cannot create an image. */
    save(): Promise<CropGramResult[]>;
    /** A data URL of the image in the cropper. */
    getCurrentCropperThumbnail(): string;
    /** Opens the file dialog. At itemsLimit, it emits limit-reached instead. */
    chooseFile(): void;
    /** Shows the image at this index in the cropper. */
    setView(id: number): void;
    /** Adds an image from a URL and shows it. */
    addNewUrl(url: string): void;
};

export type CropGramEmits = {
    /** The crop changed. */
    update: (cropData: CropGramCropData) => void;
    /** The cropper is ready. The argument is the cropper component. */
    init: (cropper: unknown) => void;
    'file-choose': (file: File) => void;
    'file-size-exceed': (file: File) => void;
    'file-type-mismatch': (file: File) => void;
    'file-loaded': () => void;
    'new-image-drawn': () => void;
    'initial-image-loaded': () => void;
    'loading-start': () => void;
    'loading-end': () => void;
    'image-error': () => void;
    'image-remove': () => void;
    move: () => void;
    zoom: () => void;
    draw: (context: CanvasRenderingContext2D) => void;
    'new-image': () => void;
    'set-view': (id: number) => void;
    'choose-file-button': () => void;
    'limit-reached': () => void;
    'has-changed': () => void;
    'thumbnail-error': (index: number) => void;
};

/**
 * The props as runtime options, like in the component. Vue 3.2 reads the prop types only from
 * this form, not from a plain interface. The props of the cropper are attributes of CropGram.
 */
type CropGramPropOptions = {
    showCropper: { type: PropType<boolean>; default: boolean };
    items: { type: PropType<string[]>; default: () => string[] };
    mimeType: { type: PropType<string>; default: string };
    compression: { type: PropType<number>; default: number };
    selectionText: { type: PropType<string>; default: string };
    selectionTextClass: { type: PropType<string>; default: string };
    itemsLimit: { type: PropType<number>; default: number };
    quality: { type: PropType<number> };
    canvasColor: { type: PropType<string> };
    placeholder: { type: PropType<string> };
    placeholderColor: { type: PropType<string> };
    placeholderFontSize: { type: PropType<number> };
    fileSizeLimit: { type: PropType<number> };
    forceCacheBreak: { type: PropType<boolean> };
    preventWhiteSpace: { type: PropType<boolean> };
};

declare const CropGram: DefineComponent<
    CropGramPropOptions,
    {},
    {},
    {},
    CropGramMethods,
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    CropGramEmits
>;

/** Registers the component globally as CropGram. */
export declare const Plugin: VuePlugin;

export default CropGram;

declare module 'vue' {
    export interface GlobalComponents {
        CropGram: typeof CropGram;
    }
}
