import {
    describe, expect, it, vi,
} from 'vitest';
import { createApp, h, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import CropGram, { Plugin } from '../src/index';
import {
    cropperOf, mountCropGram, orderBadges, orderNumbers, thumbnails, urls,
} from './helpers';

vi.mock('vue-instagram-cropper', () => import('./stubs/InstagramCropper'));

describe('items', () => {
    it('shows a thumbnail for each item and the first item in the cropper', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        expect(thumbnails(wrapper).map((img) => img.attributes('src'))).toEqual(urls);
        expect(orderNumbers(wrapper)).toEqual(['1', '2', '3']);
        expect(cropperOf(wrapper).props('src')).toBe(urls[0]);
        expect(thumbnails(wrapper)[0].classes()).toContain('active');
    });

    it('shows no selection and an empty cropper without items', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        expect(wrapper.find('.cg-selection').exists()).toBe(false);
        expect(cropperOf(wrapper).props('src')).toBeNull();
    });

    it('shows the selection text and its class', async () => {
        const wrapper = mountCropGram({ selectionText: 'Your images', selectionTextClass: 'small' });
        await nextTick();

        const text = wrapper.find('.cg-selection-text');
        expect(text.text()).toBe('Your images');
        expect(text.classes()).toContain('small');
    });

    it('hides the cropper with showCropper set to false, but keeps the selection', async () => {
        const wrapper = mountCropGram({ showCropper: false });
        await nextTick();

        expect(wrapper.find('.cp-view').isVisible()).toBe(false);
        expect(wrapper.find('.cg-selection').exists()).toBe(true);
    });
});

describe('setView()', () => {
    it('shows the clicked thumbnail in the cropper and emits set-view', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        await thumbnails(wrapper)[1].trigger('click');

        expect(cropperOf(wrapper).props('src')).toBe(urls[1]);
        expect(wrapper.emitted('set-view')).toEqual([[1]]);
        expect(thumbnails(wrapper)[1].classes()).toContain('active');
    });

    it('keeps the crop of the previous image', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        cropperOf(wrapper).vm.drag(-50);

        wrapper.vm.setView(1);
        await nextTick();
        wrapper.vm.setView(0);
        await nextTick();

        expect(cropperOf(wrapper).props('src').imgData.startX).toBe(-50);
    });
});

describe('order', () => {
    it('removes an image from the order when you click its number', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        await orderBadges(wrapper)[0].trigger('click');

        expect(orderNumbers(wrapper)).toEqual(['', '1', '2']);
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: urls[1] }, { url: urls[2] }]);
    });

    it('puts an image at the end of the order when you click it again', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        await orderBadges(wrapper)[0].trigger('click');
        await orderBadges(wrapper)[0].trigger('click');

        expect(orderNumbers(wrapper)).toEqual(['3', '1', '2']);
        await expect(wrapper.vm.save()).resolves.toEqual([
            { url: urls[1] }, { url: urls[2] }, { url: urls[0] },
        ]);
    });
});

describe('save()', () => {
    it('returns the URLs of unchanged items in their order', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        await expect(wrapper.vm.save()).resolves.toEqual(urls.map((url) => ({ url })));
    });

    it('returns a blob of the crop for a moved image', async () => {
        const wrapper = mountCropGram({ mimeType: 'image/png', compression: 0.5 });
        await nextTick();
        cropperOf(wrapper).vm.drag(-50);

        const [first, second] = await wrapper.vm.save();

        expect(first.blob).toBeInstanceOf(Blob);
        expect(first.blob.type).toBe('image/png');
        expect(first.blob.compression).toBe(0.5);
        expect(first.blob.imgData.startX).toBe(-50);
        expect(second).toEqual({ url: urls[1] });
    });

    it('returns a blob for a chosen file', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        cropperOf(wrapper).vm.loadFile('photo.jpg');
        await nextTick();
        const [result] = await wrapper.vm.save();

        expect(result.blob.img.dataset.name).toBe('photo.jpg');
    });
});

describe('new images', () => {
    it('adds a chosen file as a new item and shows it', async () => {
        const wrapper = mountCropGram({ items: [urls[0]] });
        await nextTick();

        cropperOf(wrapper).vm.loadFile('photo.jpg');
        await nextTick();

        expect(thumbnails(wrapper)[1].attributes('src')).toBe('data:image/png;name=photo.jpg');
        expect(orderNumbers(wrapper)).toEqual(['1', '2']);
        expect(thumbnails(wrapper)[1].classes()).toContain('active');
        expect(wrapper.emitted('new-image')).toHaveLength(1);
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
    });

    it('adds an image with addNewUrl()', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        wrapper.vm.addNewUrl('/images/new.jpg');
        await nextTick();

        expect(cropperOf(wrapper).props('src')).toBe('/images/new.jpg');
        expect(wrapper.emitted('new-image')).toHaveLength(1);
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: '/images/new.jpg' }]);
    });

    it('emits limit-reached and adds no image at the limit', async () => {
        const wrapper = mountCropGram({ itemsLimit: 3 });
        await nextTick();

        wrapper.vm.addNewUrl('/images/new.jpg');
        await nextTick();

        expect(wrapper.emitted('limit-reached')).toHaveLength(1);
        expect(thumbnails(wrapper)).toHaveLength(3);
    });

    it('shows the add button only below the limit', async () => {
        const below = mountCropGram({ itemsLimit: 4 });
        const at = mountCropGram({ itemsLimit: 3 });
        await nextTick();

        expect(below.find('.cg-btn-upload').exists()).toBe(true);
        expect(at.find('.cg-btn-upload').exists()).toBe(false);
    });

    it('opens the file dialog of the cropper with the add button and chooseFile()', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        await wrapper.find('.cg-btn-upload').trigger('click');
        wrapper.vm.chooseFile();

        expect(cropperOf(wrapper).vm.chooseFileCalls).toBe(2);
        expect(wrapper.emitted('choose-file-button')).toHaveLength(2);
    });

    it('returns the thumbnail of the cropper with getCurrentCropperThumbnail()', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        expect(wrapper.vm.getCurrentCropperThumbnail()).toBe(`data:image/png;name=${urls[0]}`);
    });
});

describe('remove', () => {
    it('removes the current image when the cropper removes it, and shows the previous one', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        wrapper.vm.setView(2);
        await nextTick();

        cropperOf(wrapper).vm.$emit('image-remove');
        await nextTick();

        expect(thumbnails(wrapper).map((img) => img.attributes('src'))).toEqual(urls.slice(0, 2));
        expect(cropperOf(wrapper).props('src')).toBe(urls[1]);
        expect(wrapper.emitted('image-remove')).toHaveLength(1);
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
    });

    it('shows the next image when you remove the first one', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        cropperOf(wrapper).vm.$emit('image-remove');
        await nextTick();

        expect(orderNumbers(wrapper)).toEqual(['1', '2']);
        expect(cropperOf(wrapper).props('src')).toBe(urls[1]);
    });
});

describe('changes', () => {
    it('emits move and has-changed when you move the image', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);

        expect(wrapper.emitted('move')).toHaveLength(1);
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
    });

    it('emits zoom and has-changed when you zoom', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        cropperOf(wrapper).vm.$emit('zoom');

        expect(wrapper.emitted('zoom')).toHaveLength(1);
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
    });

    it('ignores move and zoom until the cropper drew the new view', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.instantLoad = false;

        wrapper.vm.setView(1);
        await nextTick();
        cropper.$emit('move');
        cropper.$emit('zoom');

        expect(wrapper.emitted('move')).toBeUndefined();
        expect(wrapper.emitted('zoom')).toBeUndefined();
        await expect(wrapper.vm.save()).resolves.toEqual(urls.map((url) => ({ url })));
    });
});

describe('thumbnails', () => {
    it('emits thumbnail-error and shows a placeholder when a thumbnail fails', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        await thumbnails(wrapper)[1].trigger('error');

        expect(wrapper.emitted('thumbnail-error')).toEqual([[1]]);
        expect(thumbnails(wrapper)[1].attributes('src')).toMatch(/^data:image\/svg\+xml,/);
    });
});

describe('events of the cropper', () => {
    it.each([
        ['update', { img: null }],
        ['init', { name: 'cropper' }],
        ['file-choose', { name: 'photo.jpg' }],
        ['file-size-exceed', { name: 'huge.jpg' }],
        ['file-type-mismatch', { name: 'notes.txt' }],
        ['new-image-drawn', undefined],
        ['initial-image-loaded', undefined],
        ['loading-start', undefined],
        ['loading-end', undefined],
        ['image-error', undefined],
    ])('emits %s once, with the argument of the cropper', async (name, argument) => {
        const wrapper = mountCropGram();
        await nextTick();

        cropperOf(wrapper).vm.$emit(name, argument);

        expect(wrapper.emitted(name)).toEqual([[argument]]);
    });

    it.each([
        ['file-loaded', []],
        ['draw', [{ canvas: null }]],
    ])('emits %s once, with the arguments of the cropper', async (name, args) => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        cropperOf(wrapper).vm.$emit(name, ...args);

        expect(wrapper.emitted(name)).toEqual([args]);
    });

    it('gives other listeners to the cropper', async () => {
        const onImageRemoveOnload = vi.fn();
        const wrapper = mountCropGram({ onImageRemoveOnload });
        await nextTick();

        cropperOf(wrapper).vm.$emit('image-remove-onload');

        expect(onImageRemoveOnload).toHaveBeenCalledTimes(1);
    });
});

describe('attributes', () => {
    it('gives the props of the cropper to the cropper', async () => {
        const wrapper = mountCropGram({
            placeholder: 'Choose', canvasColor: '#000', fileSizeLimit: 1024,
        });
        await nextTick();

        expect(cropperOf(wrapper).attributes()).toMatchObject({
            placeholder: 'Choose', canvascolor: '#000', filesizelimit: '1024',
        });
        expect(wrapper.attributes('placeholder')).toBeUndefined();
        expect(wrapper.find('.cp-view').attributes('placeholder')).toBeUndefined();
    });

    it('puts class and style on the root element only', async () => {
        const wrapper = mountCropGram({}, {
            attrs: { class: 'my-uploader', style: 'max-width: 400px;' },
        });
        await nextTick();

        expect(wrapper.classes()).toEqual(['cg-wrapper', 'my-uploader']);
        expect(wrapper.attributes('style')).toBe('max-width: 400px;');
        expect(cropperOf(wrapper).classes()).not.toContain('my-uploader');
        expect(cropperOf(wrapper).attributes('style')).toBeUndefined();
    });
});

describe('Plugin', () => {
    it('registers the component as CropGram, also usable as crop-gram', () => {
        const app = createApp({});
        app.use(Plugin);

        expect(app.component('CropGram')).toBe(CropGram);
    });

    it('renders <crop-gram> in a template', async () => {
        const wrapper = mount({ template: '<crop-gram :items="[]" />' }, {
            global: { plugins: [Plugin] },
        });
        await flushPromises();

        expect(wrapper.find('.cg-wrapper').exists()).toBe(true);
    });

    it('works with a ref and save()', async () => {
        let cropgram;
        const wrapper = mount({
            render: () => h(CropGram, {
                items: [urls[0]],
                ref: (instance) => { cropgram = instance; },
            }),
        });
        await nextTick();

        await expect(cropgram.save()).resolves.toEqual([{ url: urls[0] }]);
        wrapper.unmount();
    });
});
