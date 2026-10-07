// The name of a blob in the result of save()
import './browser/stubs';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { nextTick } from 'vue';
import { cropperOf, mountCropGram } from './helpers';

vi.mock('vue-instagram-cropper', () => import('./stubs/InstagramCropper'));

beforeEach(() => {
    URL.createObjectURL = vi.fn((file) => `blob:https://example.com/${file.name}`);
    URL.revokeObjectURL = vi.fn();
});

const savedNames = async (wrapper) => (await wrapper.vm.save()).map((result) => result.name);

describe('names of the blobs', () => {
    it('gives a chosen file its name, with the extension of the blob type', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        cropperOf(wrapper).vm.loadFile('Holiday 2026.png');
        await nextTick();

        await expect(savedNames(wrapper)).resolves.toEqual(['Holiday 2026.jpg']);
    });

    it('gives a file from addFiles() its name', async () => {
        const wrapper = mountCropGram({ items: [], mimeType: 'image/png' });
        await nextTick();

        await wrapper.vm.addFiles([new File(['x'], 'photo.JPEG', { type: 'image/jpeg' })]);

        await expect(savedNames(wrapper)).resolves.toEqual(['photo.png']);
    });

    it('names a changed image from items after the last part of its URL', async () => {
        const wrapper = mountCropGram({
            items: ['https://cdn.example.com/users/7/beach%20day.webp?w=500', 'https://cdn.example.com/a.jpg'],
        });
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);
        const [moved, unchanged] = await wrapper.vm.save();

        expect(moved.name).toBe('beach day.jpg');
        expect(unchanged).toEqual({ url: 'https://cdn.example.com/a.jpg' });
    });

    it('adds the extension to a name without one', async () => {
        const wrapper = mountCropGram({ items: ['https://cdn.example.com/images/42'] });
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);

        await expect(savedNames(wrapper)).resolves.toEqual(['42.jpg']);
    });

    it('gives no name for a data URL', async () => {
        const wrapper = mountCropGram({ items: ['data:image/png;base64,iVBORw0KGgo='] });
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);
        const [result] = await wrapper.vm.save();

        expect(result.blob).toBeInstanceOf(Blob);
        expect(result).not.toHaveProperty('name');
    });
});
