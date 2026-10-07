// Compile-time checks for src/index.d.ts. Run with: npm run test:types
import { createApp, h, type GlobalComponents } from 'vue';
import type { InstagramCropperInstance } from 'vue-instagram-cropper';
import CropGram, {
    Plugin,
    type CropGramCropData,
    type CropGramCropperProps,
    type CropGramMethods,
    type CropGramProps,
    type CropGramResult,
} from '../../src/index';

createApp({}).use(Plugin);
createApp({}).component('CropGram', CropGram);

const props: CropGramProps = {
    items: ['/images/a.jpg'],
    itemsLimit: 6,
    mimeType: 'image/png',
    compression: 0.9,
    selectionText: 'Your images',
    showCropper: false,
    multiple: true,
    labels: { add: 'Bilder hinzufügen', image: 'Bild {index}' },
};

// @ts-expect-error labels are texts
h(CropGram, { labels: { add: 1 } });

const cropperProps: CropGramCropperProps = {
    placeholder: 'Choose an image',
    fileSizeLimit: 20000 * 1024,
    preventWhiteSpace: true,
};

h(CropGram, {
    ...props,
    ...cropperProps,
    onInit: (cropper: InstagramCropperInstance) => cropper.chooseFile(),
    onUpdate: (cropData: CropGramCropData) => cropData.img?.src ?? cropData.imgData.startX,
    onSetView: (id: number) => id,
    onThumbnailError: (index: number) => index,
    onImageError: (file?: File) => file?.name,
    'onFile-size-exceed': (file: File) => file.size,
});

// @ts-expect-error itemsLimit is a number
h(CropGram, { itemsLimit: 'four' });

// @ts-expect-error items are URLs
h(CropGram, { items: [{ url: '/images/a.jpg' }] });

// @ts-expect-error placeholderFontSize of the cropper is a number
h(CropGram, { placeholderFontSize: 'big' });

// @ts-expect-error CropGram sets src of the cropper itself
const withSrc: CropGramCropperProps = { src: '/images/a.jpg' };

declare const instance: InstanceType<typeof CropGram>;
const methods: CropGramMethods = instance;
const saved: Promise<CropGramResult[]> = instance.save();
const thumbnail: string = instance.getCurrentCropperThumbnail();
instance.chooseFile();
instance.setView(1);
instance.addNewUrl('/images/b.jpg');
declare const fileList: FileList;
const added: Promise<number> = instance.addFiles(fileList);
instance.addFiles([new File([], 'a.jpg')]);

// @ts-expect-error addFiles needs files
instance.addFiles(['/images/a.jpg']);

// The README example: append each result to a FormData
saved.then((results) => {
    const data = new FormData();
    results.forEach((picture, index) => {
        if (picture.url !== undefined) data.append(`media[${index}]`, picture.url);
        else data.append(`media[${index}]`, picture.blob, picture.name);
    });
    return data;
});

// The plugin registers the component globally for templates
const global: typeof CropGram = {} as GlobalComponents['CropGram'];

export {
    methods, thumbnail, global, withSrc, added,
};
