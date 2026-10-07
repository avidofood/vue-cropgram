// addFiles() and the prop multiple. The browser stubs load an image for a URL such as
// blob:…/photo-800x600.jpg with 800 x 600 pixels, other images with 1000 x 500 pixels.
import './browser/stubs';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { nextTick } from 'vue';
import {
    cropperOf, cropperSrc, mountCropGram, thumbnails, urls,
} from './helpers';

vi.mock('vue-instagram-cropper', () => import('./stubs/InstagramCropper'));

const image = (name, bytes = 100) => new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });

beforeEach(() => {
    URL.createObjectURL = vi.fn((file) => `blob:https://example.com/${file.name}`);
    URL.revokeObjectURL = vi.fn();
});

describe('prop multiple', () => {
    it('renders a file input for several files only with multiple', async () => {
        const single = mountCropGram();
        const multiple = mountCropGram({ multiple: true });
        await nextTick();

        expect(single.find('.cg-file-input').exists()).toBe(false);
        const input = multiple.find('.cg-file-input');
        expect(input.attributes()).toMatchObject({ type: 'file', accept: 'image/*' });
        expect(input.element.multiple).toBe(true);
    });

    it('opens its own file dialog with the add button and chooseFile()', async () => {
        const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
        const wrapper = mountCropGram({ multiple: true });
        await nextTick();

        await wrapper.find('.cg-btn-upload').trigger('click');
        wrapper.vm.chooseFile();

        expect(click).toHaveBeenCalledTimes(2);
        expect(click.mock.contexts[0]).toBe(wrapper.find('.cg-file-input').element);
        expect(cropperOf(wrapper).vm.chooseFileCalls).toBe(0);
        expect(wrapper.emitted('choose-file-button')).toHaveLength(2);
        click.mockRestore();
    });

    it('adds the files from its input and clears the input', async () => {
        const wrapper = mountCropGram({ items: [], multiple: true });
        await nextTick();
        const input = wrapper.find('.cg-file-input');
        const files = [image('a.jpg'), image('b.jpg')];
        Object.defineProperty(input.element, 'files', { value: files, configurable: true });

        await input.trigger('change');
        await vi.waitFor(() => {
            if (thumbnails(wrapper).length !== 2) throw new Error('not added yet');
        });

        expect(input.element.value).toBe('');
        expect(wrapper.emitted('file-choose')).toEqual([[files[0]], [files[1]]]);
    });
});

describe('addFiles()', () => {
    it('adds the files in their order and shows the first new image', async () => {
        const wrapper = mountCropGram({ items: [urls[0]] });
        await nextTick();

        const added = await wrapper.vm.addFiles([image('photo-1000x500.jpg'), image('photo-500x1000.jpg')]);
        await nextTick();

        expect(added).toBe(2);
        expect(thumbnails(wrapper).map((img) => img.attributes('src'))).toEqual([
            urls[0], 'data:image/png;crop=1200x600', 'data:image/png;crop=600x1200',
        ]);
        expect(thumbnails(wrapper)[1].classes()).toContain('active');
        expect(cropperSrc(wrapper).img.naturalWidth).toBe(1000);
        expect(wrapper.emitted('new-image')).toHaveLength(2);
        expect(wrapper.emitted('has-changed')).toHaveLength(2);
    });

    it('places a new image like the cropper places a chosen file: filled and centered', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        await wrapper.vm.addFiles([image('photo-1000x500.jpg'), image('photo-500x1000.jpg')]);
        const [wide, tall] = await wrapper.vm.save();

        expect(wide.blob.imgData).toEqual({
            width: 1200, height: 600, startX: -300, startY: 0,
        });
        expect(tall.blob.imgData).toEqual({
            width: 600, height: 1200, startX: 0, startY: -300,
        });
    });

    it('adds only as many files as fit and emits limit-reached once', async () => {
        const wrapper = mountCropGram({ items: urls.slice(0, 2), itemsLimit: 3 });
        await nextTick();

        const added = await wrapper.vm.addFiles([image('a.jpg'), image('b.jpg'), image('c.jpg')]);

        expect(added).toBe(1);
        expect(thumbnails(wrapper)).toHaveLength(3);
        expect(wrapper.emitted('limit-reached')).toHaveLength(1);
        // Only the file that fits is loaded
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });

    it('skips files that do not fit and adds the others', async () => {
        const wrapper = mountCropGram({ items: [] }, { attrs: { fileSizeLimit: 500 } });
        await nextTick();
        const text = new File(['hello'], 'notes.txt', { type: 'text/plain' });
        const huge = image('huge.jpg', 500);
        const broken = image('broken.jpg');
        const fine = image('fine.jpg');

        const added = await wrapper.vm.addFiles([text, huge, broken, fine]);

        expect(added).toBe(1);
        expect(wrapper.emitted('file-type-mismatch')).toEqual([[text]]);
        expect(wrapper.emitted('file-size-exceed')).toEqual([[huge]]);
        expect(wrapper.emitted('image-error')).toEqual([[broken]]);
        expect(wrapper.emitted('file-choose')).toHaveLength(4);
    });

    it('keeps the latest crop of the current image', async () => {
        const wrapper = mountCropGram({ items: [urls[0]] });
        await nextTick();
        cropperOf(wrapper).vm.drag(-40);

        await wrapper.vm.addFiles([image('a.jpg')]);
        const [first] = await wrapper.vm.save();

        expect(first.blob.imgData.startX).toBe(-40);
    });

    it('revokes the object URLs after the load', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        await wrapper.vm.addFiles([image('a.jpg'), image('broken.jpg')]);

        expect(URL.revokeObjectURL.mock.calls).toEqual([
            ['blob:https://example.com/a.jpg'], ['blob:https://example.com/broken.jpg'],
        ]);
    });

    it('does not add images after an unmount during the load', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();

        // The browser stubs load this file after 200 ms
        const first = wrapper.vm.addFiles([image('a-delay-200.jpg')]);
        const second = wrapper.vm.addFiles([image('b.jpg')]);
        // The first call loads its file now, the second one waits
        await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(1));
        wrapper.unmount();

        await expect(first).resolves.toBe(0);
        await expect(second).resolves.toBe(0);
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('new-image')).toBeUndefined();
    });

    it('reports an image error when the cropper has no size', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        cropperOf(wrapper).vm.outputWidth = 0;
        const file = image('a.jpg');

        await expect(wrapper.vm.addFiles([file])).resolves.toBe(0);
        expect(wrapper.emitted('image-error')).toEqual([[file]]);
    });

    it('counts the first move after the added files', async () => {
        const wrapper = mountCropGram({ items: [] });
        await nextTick();
        await wrapper.vm.addFiles([image('a.jpg')]);
        await nextTick();

        cropperOf(wrapper).vm.drag(-10);

        expect(wrapper.emitted('move')).toHaveLength(1);
    });
});

describe('addFiles() called twice', () => {
    it('adds the files in the order of the calls and emits limit-reached for the call that does not fit', async () => {
        const wrapper = mountCropGram({ items: urls.slice(0, 2), itemsLimit: 3 });
        await nextTick();
        const limits = () => (wrapper.emitted('limit-reached') || []).length;

        const first = wrapper.vm.addFiles([image('photo-1000x500.jpg')]);
        const second = wrapper.vm.addFiles([image('photo-500x1000.jpg')]);

        await expect(first).resolves.toBe(1);
        await expect(second).resolves.toBe(0);
        expect(limits()).toBe(1);
        expect(wrapper.vm.sortedItems[2].cropper.img.naturalWidth).toBe(1000);
    });
});

describe('file input of multiple', () => {
    it('is no keyboard stop and hidden from screen readers', async () => {
        const wrapper = mountCropGram({ multiple: true });
        await nextTick();

        expect(wrapper.find('.cg-file-input').attributes()).toMatchObject({
            tabindex: '-1', 'aria-hidden': 'true',
        });
    });
});
