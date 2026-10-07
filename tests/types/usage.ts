// Compile-time checks for src/index.d.ts. Run with: npm run test:types
import { createApp, h, type GlobalComponents } from 'vue';
import CropGram, {
    Plugin,
    type CropGramCropData,
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
};

h(CropGram, {
    ...props,
    placeholder: 'Choose an image',
    fileSizeLimit: 20000 * 1024,
    onUpdate: (cropData: CropGramCropData) => cropData.imgData.startX,
    onSetView: (id: number) => id,
    onThumbnailError: (index: number) => index,
    'onFile-size-exceed': (file: File) => file.size,
});

// @ts-expect-error itemsLimit is a number
h(CropGram, { itemsLimit: 'four' });

// @ts-expect-error items are URLs
h(CropGram, { items: [{ url: '/images/a.jpg' }] });

declare const instance: InstanceType<typeof CropGram>;
const methods: CropGramMethods = instance;
const saved: Promise<CropGramResult[]> = instance.save();
const thumbnail: string = instance.getCurrentCropperThumbnail();
instance.chooseFile();
instance.setView(1);
instance.addNewUrl('/images/b.jpg');

// The README example: append each result to a FormData
saved.then((results) => {
    const data = new FormData();
    results.forEach((picture, index) => {
        data.append(`media[${index}]`, picture.url ?? picture.blob);
    });
    return data;
});

// The plugin registers the component globally for templates
const global: typeof CropGram = {} as GlobalComponents['CropGram'];

export {
    methods, thumbnail, global,
};
