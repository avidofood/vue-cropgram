// CropGram with the real vue-instagram-cropper 2.x. The other test files use a stub of the cropper.
import './browser/stubs';
import {
    afterAll, beforeAll, describe, expect, it, vi,
} from 'vitest';
import { mount } from '@vue/test-utils';
import InstagramCropper from 'vue-instagram-cropper';
import CropGram from '../src/index';
import { cropperEvents, handledCropperEvents } from '../src/core/events';
import Stub, { events as stubEvents } from './stubs/InstagramCropper';

// 800 x 600 and 600 x 800 pixels, see tests/browser/stubs.js
const landscape = 'https://example.com/photo-800x600.jpg';
const portrait = 'https://example.com/photo-600x800.jpg';

// The cropper takes the size of its container. With quality 2, the canvas is 600 x 600.
let style;
beforeAll(() => {
    style = document.createElement('style');
    style.textContent = '.cropper-container { width: 300px; height: 300px; }';
    document.head.append(style);
});
afterAll(() => style.remove());

const mountCropGram = (props = {}) => mount(CropGram, {
    props: { items: [landscape, portrait], ...props },
    attachTo: document.body,
});

const cropperOf = (wrapper) => wrapper.findComponent(InstagramCropper).vm;

// The URL of the image in the cropper, without the fragment that CropGram adds
const shownUrl = (wrapper) => cropperOf(wrapper).getMetadata().img?.src.split('#')[0];

// Waits until the cropper shows the image with this URL
const waitForImage = (wrapper, url) => vi.waitFor(() => {
    if (shownUrl(wrapper) !== url) throw new Error(`The cropper does not show ${url} yet`);
});

const settle = () => new Promise((resolve) => { setTimeout(resolve, 50); });

describe('contract with vue-instagram-cropper', () => {
    it('has the methods and properties that CropGram uses', () => {
        const wrapper = mount(InstagramCropper, { attachTo: document.body });
        const cropper = wrapper.vm;

        ['chooseFile', 'hasImage', 'getMetadata', 'generateDataUrl', 'saving'].forEach((name) => {
            expect(typeof cropper[name], name).toBe('function');
        });
        expect(typeof cropper.outputWidth).toBe('number');
        expect(typeof cropper.outputHeight).toBe('number');
    });

    it('emits every event that CropGram passes on', () => {
        const declared = InstagramCropper.emits;

        [...cropperEvents, ...handledCropperEvents].forEach((name) => {
            expect(declared, name).toContain(name);
        });
    });

    it('has every method and event of the stub in the unit tests', () => {
        const wrapper = mount(InstagramCropper, { attachTo: document.body });
        const helpers = ['finishLoad', 'loadFile', 'removeImage', 'zoomIn', 'drag'];

        Object.keys(Stub.methods)
            .filter((name) => !helpers.includes(name))
            .forEach((name) => expect(typeof wrapper.vm[name], name).toBe('function'));
        stubEvents.forEach((name) => expect(InstagramCropper.emits, name).toContain(name));
    });
});

describe('CropGram with the real cropper', () => {
    it('shows the first item and saves unchanged items as URLs', async () => {
        const wrapper = mountCropGram();
        await waitForImage(wrapper, landscape);

        expect(cropperOf(wrapper).outputWidth).toBe(600);
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: landscape }, { url: portrait }]);
    });

    it('saves a blob of the crop after a move', async () => {
        const wrapper = mountCropGram({ mimeType: 'image/png' });
        await waitForImage(wrapper, landscape);
        await settle();

        cropperOf(wrapper).move({ x: -40, y: 0 });
        const [first, second] = await wrapper.vm.save();

        expect(wrapper.emitted('move')).toHaveLength(1);
        expect(wrapper.emitted('has-changed')).toHaveLength(1);
        expect(first.blob).toBeInstanceOf(Blob);
        expect(first.blob.type).toBe('image/png');
        expect(second).toEqual({ url: portrait });
    });

    it('keeps the crop after a view change and does not count the restore as a change', async () => {
        const wrapper = mountCropGram();
        await waitForImage(wrapper, landscape);
        await settle();
        // Zoom in first, so that the move stays inside the canvas and the cropper keeps it
        cropperOf(wrapper).zoom(true, 20);
        await settle();
        cropperOf(wrapper).move({ x: -40, y: 0 });
        await settle();
        const moved = cropperOf(wrapper).getMetadata().imgData;
        const changes = wrapper.emitted('has-changed').length;

        wrapper.vm.setView(1);
        await waitForImage(wrapper, portrait);
        await settle();
        wrapper.vm.setView(0);
        await waitForImage(wrapper, landscape);
        await settle();

        expect(cropperOf(wrapper).getMetadata().imgData).toEqual(moved);
        expect(wrapper.emitted('has-changed')).toHaveLength(changes);
        const [first, second] = await wrapper.vm.save();
        expect(first.blob).toBeInstanceOf(Blob);
        expect(second).toEqual({ url: portrait });
    });

    it('adds a chosen file as a new item', async () => {
        const wrapper = mountCropGram({ items: [landscape] });
        await waitForImage(wrapper, landscape);
        await settle();

        const input = wrapper.find('input[type="file"]');
        const file = new File([new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9])], 'photo.jpg', { type: 'image/jpeg' });
        Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
        await input.trigger('change');
        await vi.waitFor(() => {
            if (!wrapper.emitted('new-image')) throw new Error('no new image yet');
        });

        expect(wrapper.emitted('file-choose')).toEqual([[file]]);
        expect(wrapper.findAll('.roll-element img')).toHaveLength(2);
        const results = await wrapper.vm.save();
        expect(results[0]).toEqual({ url: landscape });
        expect(results[1].blob).toBeInstanceOf(Blob);
    });

    it('removes the current image and shows the previous one unchanged', async () => {
        const wrapper = mountCropGram();
        await waitForImage(wrapper, landscape);
        await settle();
        wrapper.vm.setView(1);
        await waitForImage(wrapper, portrait);
        await settle();

        cropperOf(wrapper).remove();
        await waitForImage(wrapper, landscape);
        await settle();

        expect(wrapper.emitted('image-remove')).toHaveLength(1);
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: landscape }]);
    });
});

describe('URLs with the real cropper', () => {
    it('records a change of a relative URL with forceCacheBreak and a base element', async () => {
        const base = document.createElement('base');
        base.href = 'https://cdn.example.com/assets/';
        document.head.append(base);
        try {
            const wrapper = mount(CropGram, {
                props: { items: ['photo-800x600.jpg'] },
                attrs: { forceCacheBreak: true },
                attachTo: document.body,
            });
            await vi.waitFor(() => {
                const { img } = cropperOf(wrapper).getMetadata();
                if (!img) throw new Error('no image yet');
            });
            await settle();

            // The browser loads the image from the base URL
            expect(cropperOf(wrapper).getMetadata().img.src)
                .toMatch(/^https:\/\/cdn\.example\.com\/assets\/photo-800x600\.jpg\?cors=/);
            cropperOf(wrapper).zoom(true, 20);
            await settle();
            const [result] = await wrapper.vm.save();
            expect(result.blob).toBeInstanceOf(Blob);
        } finally {
            base.remove();
        }
    });
});

describe('addFiles() with the real cropper', () => {
    it('places a file like the cropper places a chosen file', async () => {
        URL.createObjectURL = vi.fn(() => 'blob:https://example.com/photo');
        URL.revokeObjectURL = vi.fn();
        const wrapper = mountCropGram({ items: [] });
        await vi.waitFor(() => {
            if (!cropperOf(wrapper).outputWidth) throw new Error('no size yet');
        });
        const file = () => new File([new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9])], 'photo.jpg', { type: 'image/jpeg' });

        // The file chooser of the cropper
        const input = wrapper.find('.cropper-container input[type="file"]');
        Object.defineProperty(input.element, 'files', { value: [file()], configurable: true });
        await input.trigger('change');
        await vi.waitFor(() => {
            if (!wrapper.emitted('new-image')) throw new Error('no new image yet');
        });
        await settle();

        // The same image through addFiles()
        await wrapper.vm.addFiles([file()]);
        await settle();

        const [chosen, added] = wrapper.vm.sortedItems.map((item) => item.cropper.imgData);
        expect(added).toEqual(chosen);
        const results = await wrapper.vm.save();
        expect(results.map((result) => result.blob.size > 0)).toEqual([true, true]);
    });
});
