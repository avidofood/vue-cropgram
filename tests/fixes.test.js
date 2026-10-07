import {
    describe, expect, it, vi,
} from 'vitest';
import { nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
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

describe('review of 2.0.0-dev (Codex Astra)', () => {
    const uploadThree = async (wrapper) => {
        const cropper = cropperOf(wrapper).vm;
        const images = [];
        cropper.loadFile('a.jpg');
        await nextTick();
        images.push(cropper.img);
        cropper.loadFile('b.jpg');
        await nextTick();
        images.push(cropper.img);
        cropper.loadFile('c.jpg');
        await nextTick();
        images.push(cropper.img);
        return images;
    };

    it('keeps the crop of an image when you switch views twice while the cropper loads', async () => {
        const wrapper = mountCropGram({ items: [], itemsLimit: 3 });
        await nextTick();
        const [a, b] = await uploadThree(wrapper);
        const cropper = cropperOf(wrapper).vm;

        cropper.instantLoad = false;
        wrapper.vm.setView(0);
        await nextTick();
        wrapper.vm.setView(1);
        await nextTick();
        const results = await wrapper.vm.save();

        // The cropper still shows c.jpg. Neither a.jpg nor b.jpg may get its crop.
        expect(results[0].blob.img).toBe(a);
        expect(results[1].blob.img).toBe(b);
    });

    it('keeps the change of the current image when you add a URL', async () => {
        const wrapper = mountCropGram({ items: [urls[0]] });
        await nextTick();
        cropperOf(wrapper).vm.drag(-40);

        wrapper.vm.addNewUrl('/images/new.jpg');
        await nextTick();
        const results = await wrapper.vm.save();

        expect(results).toHaveLength(2);
        expect(results[0].blob.imgData.startX).toBe(-40);
        expect(results[1]).toEqual({ url: '/images/new.jpg' });
    });

    it('marks the image as changed before it emits has-changed', async () => {
        let saved;
        const wrapper = mountCropGram({
            items: [urls[0]],
            'onHas-changed': () => { saved = wrapper.vm.save(); },
        });
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);
        const [result] = await saved;

        expect(result.blob).toBeInstanceOf(Blob);
    });

    it('does not open the file dialog at the limit', async () => {
        const wrapper = mountCropGram({ items: [urls[0]], itemsLimit: 1 });
        await nextTick();

        wrapper.vm.chooseFile();

        expect(cropperOf(wrapper).vm.chooseFileCalls).toBe(0);
        expect(wrapper.emitted('limit-reached')).toHaveLength(1);
        expect(wrapper.emitted('choose-file-button')).toBeUndefined();
    });

    it('does not save the image of a rejected file in place of the current image', async () => {
        let saved;
        const wrapper = mountCropGram({
            items: [],
            itemsLimit: 1,
            'onLimit-reached': () => { saved = wrapper.vm.save(); },
        });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.loadFile('accepted.jpg');
        await nextTick();
        const accepted = cropper.img;

        // The cropper loads a file itself, for example after a drop
        cropper.loadFile('rejected.jpg');
        await nextTick();
        const [result] = await saved;

        expect(result.blob.img).toBe(accepted);
    });

    it('ignores a move of a rejected file in the cropper', async () => {
        const wrapper = mountCropGram({ items: [urls[0]], itemsLimit: 1 });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.instantLoad = false;

        cropper.loadFile('rejected.jpg');
        await nextTick();
        cropper.drag(-10);

        expect(wrapper.emitted('move')).toBeUndefined();
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: urls[0] }]);
    });

    it('records a zoom after a click on the current thumbnail', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        wrapper.vm.setView(0);
        await nextTick();
        cropperOf(wrapper).vm.zoomIn();
        const [result] = await wrapper.vm.save();

        expect(wrapper.emitted('zoom')).toHaveLength(1);
        expect(result.blob).toBeInstanceOf(Blob);
    });

    it('does not send the stored crop to the cropper again when it stores the crop', async () => {
        // The real cropper loads a new src after 30 ms. If the chosen file is not drawn by then,
        // the old crop replaces it, and the new item gets the old image.
        const wrapper = mountCropGram({ items: [urls[0]] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.drag(-20);

        cropper.$emit('file-loaded');
        await nextTick();
        wrapper.vm.setView(0);
        await nextTick();

        expect(new URL(cropper.$props.src).pathname).toBe(urls[0]);
    });

    it('rejects save() when the browser cannot create a blob', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.drag(-10);

        cropper.outputWidth = 0;

        await expect(wrapper.vm.save()).rejects.toThrow('could not create the image');
    });
});

describe('short review of the fixes (Codex)', () => {
    it('counts a move back to the stored crop as a change', async () => {
        const wrapper = mountCropGram({ items: urls.slice(0, 2) });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.drag(-30);
        wrapper.vm.setView(1);
        await nextTick();
        wrapper.vm.setView(0);
        await nextTick();
        const moves = wrapper.emitted('move').length;

        // Away from the stored crop and back, for example a bounce back to the edge
        cropper.drag(30);
        cropper.drag(-30);

        expect(wrapper.emitted('move')).toHaveLength(moves + 2);
    });

    it('counts the first move after a new file', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.loadFile('photo.jpg');
        await nextTick();

        // The cropper shows the new image already and does not draw it again
        cropper.drag(-10);

        expect(wrapper.emitted('move')).toHaveLength(1);
    });

    it('loads an image again when the same URL is twice in items', async () => {
        const wrapper = mountCropGram({ items: [urls[0], urls[0]] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.drag(-40);

        wrapper.vm.setView(1);
        await nextTick();

        // The second item starts with its own load, not with the crop of the first
        expect(cropper.imgData.startX).toBe(0);
        cropper.drag(-10);
        const results = await wrapper.vm.save();
        expect(results[0].blob.imgData.startX).toBe(-40);
        expect(results[1].blob.imgData.startX).toBe(-10);
    });
});

describe('open findings of the last short review (Codex)', () => {
    it('counts a zoom after a switch back before the other image loaded', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.loadFile('a.jpg');
        await nextTick();
        cropper.loadFile('b.jpg');
        await nextTick();
        wrapper.vm.setView(0);
        await nextTick();

        // B does not load in time, so the cropper still shows A when the view comes back to A
        cropper.instantLoad = false;
        wrapper.vm.setView(1);
        await nextTick();
        wrapper.vm.setView(0);
        await nextTick();
        // The cropper applies the stored crop of A to A: no change, so it does not draw
        cropper.finishLoad();
        const changes = wrapper.emitted('has-changed').length;
        cropper.zoomIn();

        expect(wrapper.emitted('has-changed')).toHaveLength(changes + 1);
    });

    it('loads an image again when the same URL with a fragment is twice in items', async () => {
        const url = '/images/a.jpg#preview';
        const wrapper = mountCropGram({ items: [url, url] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.drag(-40);

        wrapper.vm.setView(1);
        await flushPromises();

        expect(cropper.imgData.startX).toBe(0);
        cropper.drag(-10);
        const results = await wrapper.vm.save();
        expect(results[0].blob.imgData.startX).toBe(-40);
        expect(results[1].blob.imgData.startX).toBe(-10);
    });
});

describe('full review of the feature round (Codex)', () => {
    it('does not store the crop of the shown image in a reloading item with the same URL', async () => {
        const url = '/images/a.jpg#preview';
        const wrapper = mountCropGram({ items: [url, url] });
        await nextTick();
        const cropper = cropperOf(wrapper).vm;
        cropper.drag(-40);

        // The reload of the second item has not finished when the view comes back
        cropper.instantLoad = false;
        wrapper.vm.setView(1);
        await flushPromises();
        wrapper.vm.setView(0);
        await flushPromises();

        expect(wrapper.vm.sortedItems[1].cropper).toEqual({});
        const results = await wrapper.vm.save();
        expect(results[0].blob.imgData.startX).toBe(-40);
        expect(results[1]).toEqual({ url });
    });
});
