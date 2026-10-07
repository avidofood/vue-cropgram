import type {
    ComponentOptionsMixin, DefineComponent, Plugin as VuePlugin, PropType,
} from 'vue';
import type {
    InstagramCropperEmptyMetadata,
    InstagramCropperInstance,
    InstagramCropperMetadata,
    InstagramCropperProps,
} from 'vue-instagram-cropper';

/** An image in the result of `save()`. */
export type CropGramResult =
    /** An unchanged image of the `items` prop. */
    | { url: string; blob?: undefined }
    /**
     * A chosen file, or an image that you moved or zoomed. name is the name of the chosen file
     * or the last part of the URL, with the extension of the blob type. A data URL has no name.
     */
    | { blob: Blob; name?: string; url?: undefined };

/**
 * The image and its crop in the cropper. The update event carries it.
 * After a remove, img can be null.
 */
export type CropGramCropData = InstagramCropperMetadata | InstagramCropperEmptyMetadata;

/**
 * Texts for screen readers. {index} is the number of the image, starting at 1. {order} is the
 * place of a chosen image in the result of save().
 */
export interface CropGramLabels {
    /** The add button. Default: 'Add images'. */
    add?: string;
    /** The alt text of a thumbnail. Default: 'Image {index}'. */
    image?: string;
    /** The button with the order number. Default: 'Choose image {index}'. */
    choose?: string;
    /** The description of the button of a chosen image. Default: 'Number {order}'. */
    position?: string;
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
    /** The add button and chooseFile() let the user choose several files at once. Default: false. */
    multiple?: boolean;
    /** Texts for screen readers. A text that you leave out keeps its default. */
    labels?: CropGramLabels;
}

/**
 * Props of vue-instagram-cropper. CropGram gives them to the cropper. CropGram sets src itself.
 * See https://github.com/avidofood/vue-instagram-cropper for the details.
 */
export type CropGramCropperProps = Omit<InstagramCropperProps, 'src'>;

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
    /**
     * Adds image files and shows the first new one. Files over itemsLimit are left out.
     * Resolves with the number of added images.
     */
    addFiles(files: FileList | File[]): Promise<number>;
};

export type CropGramEmits = {
    /** The crop changed. */
    update: (cropData: CropGramCropData) => void;
    /** The cropper is ready. The argument is the cropper component. */
    init: (cropper: InstagramCropperInstance) => void;
    'file-choose': (file: File) => void;
    'file-size-exceed': (file: File) => void;
    'file-type-mismatch': (file: File) => void;
    'file-loaded': () => void;
    'new-image-drawn': () => void;
    'initial-image-loaded': () => void;
    'loading-start': () => void;
    'loading-end': () => void;
    /** An image did not load. For a file from addFiles(), the event carries the file. */
    'image-error': (file?: File) => void;
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

/** The props of the cropper as runtime options. They are attributes of CropGram. */
type CropGramCropperPropOptions = {
    [K in keyof CropGramCropperProps]-?: { type: PropType<NonNullable<CropGramCropperProps[K]>> };
};

/**
 * The props as runtime options, like in the component. Vue 3.2 reads the prop types only from
 * this form, not from a plain interface.
 */
type CropGramPropOptions = CropGramCropperPropOptions & {
    showCropper: { type: PropType<boolean>; default: boolean };
    items: { type: PropType<string[]>; default: () => string[] };
    mimeType: { type: PropType<string>; default: string };
    compression: { type: PropType<number>; default: number };
    selectionText: { type: PropType<string>; default: string };
    selectionTextClass: { type: PropType<string>; default: string };
    itemsLimit: { type: PropType<number>; default: number };
    multiple: { type: PropType<boolean>; default: boolean };
    labels: { type: PropType<CropGramLabels>; default: () => CropGramLabels };
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
