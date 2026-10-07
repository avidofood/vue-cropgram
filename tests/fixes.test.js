import {
    describe, expect, it, vi,
} from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import CropGram from '../src/index';
import {
    cropperOf, mountCropGram, orderBadges, orderNumbers, urls,
} from './helpers';

vi.mock('vue-instagram-cropper', () => import('./stubs/InstagramCropper'));

describe('save() returns the crop that you see (#6)', () => {
    it('uses the latest crop of the current image, also without a view change', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.loadFile('photo.jpg');
        await nextTick();

        cropper.drag(-80);
        const [result] = await wrapper.vm.save();

        expect(result.blob.imgData.startX).toBe(-80);
    });

    it('keeps the image element when you change the order', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.loadFile('first.jpg');
        await nextTick();
        const { img } = cropper.getMetadata();
        cropper.loadFile('second.jpg');
        await nextTick();

        // Deselect and select the first image again, then save while the second one is shown
        await orderBadges(wrapper)[0].trigger('click');
        await orderBadges(wrapper)[0].trigger('click');
        const results = await wrapper.vm.save();

        expect(orderNumbers(wrapper)).toEqual(['2', '1']);
        expect(results[1].blob.img).toBe(img);
    });

    it('resolves the blob of a moved image from the items prop', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);
        const [result] = await wrapper.vm.save();

        expect(result.blob).toBeInstanceOf(Blob);
    });
});

describe('save() after a view change', () => {
    it('keeps an unchanged image of the items prop after you looked at it', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        wrapper.vm.setView(1);
        await nextTick();

        await expect(wrapper.vm.save()).resolves.toEqual(urls.map((url) => ({ url })));
    });

    it('uses the stored crop while the cropper still loads the new view', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.loadFile('first.jpg');
        await nextTick();
        cropper.drag(-30);
        cropper.loadFile('second.jpg');
        await nextTick();

        cropper.instantLoad = false;
        wrapper.vm.setView(0);
        await nextTick();
        const [first] = await wrapper.vm.save();

        // The cropper still shows second.jpg
        expect(cropper.img.dataset.name).toBe('second.jpg');
        expect(first.blob.img.dataset.name).toBe('first.jpg');
        expect(first.blob.imgData.startX).toBe(-30);
    });
});

describe('remove', () => {
    it('keeps the order of the chosen images when you remove an image that is not chosen', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        await orderBadges(wrapper)[1].trigger('click');
        expect(orderNumbers(wrapper)).toEqual(['1', '', '2']);

        wrapper.vm.setView(1);
        await nextTick();
        cropperOf(wrapper).vm.$emit('image-remove');
        await nextTick();

        expect(orderNumbers(wrapper)).toEqual(['1', '2']);
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: urls[0] }, { url: urls[2] }]);
    });
});

describe('remove the current image', () => {
    it('does not mark the next image as changed while the cropper loads it', async () => {
        const wrapper = mountCropGram({ items: urls.slice(0, 2) });
        await nextTick();
        // The view change stores the crop of the first image
        wrapper.vm.setView(1);
        await nextTick();

        cropperOf(wrapper).vm.removeImage();
        await nextTick();

        expect(wrapper.emitted('zoom')).toBeUndefined();
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: urls[0] }]);
    });

    it('emits move again after the cropper drew the next image', async () => {
        const wrapper = mountCropGram({ items: urls.slice(0, 2) });
        await nextTick();
        wrapper.vm.setView(1);
        await nextTick();
        cropperOf(wrapper).vm.removeImage();
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);

        expect(wrapper.emitted('move')).toHaveLength(1);
    });
});

describe('no current image', () => {
    it('does not throw when the cropper moves an image that is not in the list', async () => {
        const wrapper = mountCropGram({ items: [], itemsLimit: 0 });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;

        cropper.loadFile('photo.jpg');
        await nextTick();

        expect(wrapper.emitted('limit-reached')).toHaveLength(1);
        expect(() => cropper.drag(-10)).not.toThrow();
        expect(() => wrapper.vm.setView(0)).not.toThrow();
    });
});

describe('add button', () => {
    it('does not submit a form around the component', async () => {
        const onSubmit = vi.fn((event) => event.preventDefault());
        const wrapper = mount({
            components: { CropGram },
            setup: () => ({ urls, onSubmit }),
            template: '<form @submit="onSubmit"><crop-gram :items="urls" /></form>',
        }, { attachTo: document.body });
        await nextTick();

        await wrapper.find('.cg-btn-upload').trigger('click');

        expect(wrapper.find('.cg-btn-upload').attributes('type')).toBe('button');
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
