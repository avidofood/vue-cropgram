// Names, roles and states for screen readers and keyboards (W3C ARIA button pattern)
import {
    describe, expect, it, vi,
} from 'vitest';
import { nextTick } from 'vue';
import { mountCropGram, urls } from './helpers';

vi.mock('vue-instagram-cropper', () => import('./stubs/InstagramCropper'));

const viewButtons = (wrapper) => wrapper.findAll('.roll-element-view');
const orderButtons = (wrapper) => wrapper.findAll('.roll-element-order');

describe('accessibility', () => {
    it('gives the add button a name and hides its icon', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        const button = wrapper.find('.cg-btn-upload');

        expect(button.attributes('aria-label')).toBe('Add images');
        expect(button.find('svg').attributes()).toMatchObject({ 'aria-hidden': 'true', focusable: 'false' });
    });

    it('shows each thumbnail in a button, with alt text and the current one marked', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        expect(viewButtons(wrapper)).toHaveLength(3);
        viewButtons(wrapper).forEach((button) => expect(button.element.tagName).toBe('BUTTON'));
        expect(viewButtons(wrapper).map((button) => button.attributes('type'))).toEqual(['button', 'button', 'button']);
        expect(wrapper.findAll('.roll-element img').map((img) => img.attributes('alt')))
            .toEqual(['Image 1', 'Image 2', 'Image 3']);
        expect(viewButtons(wrapper).map((button) => button.attributes('aria-current')))
            .toEqual(['true', undefined, undefined]);

        await viewButtons(wrapper)[2].trigger('click');

        expect(wrapper.emitted('set-view')).toEqual([[2]]);
        expect(viewButtons(wrapper).map((button) => button.attributes('aria-current')))
            .toEqual([undefined, undefined, 'true']);
    });

    it('makes the order number a toggle button', async () => {
        const wrapper = mountCropGram();
        await nextTick();
        const first = () => orderButtons(wrapper)[0];

        expect(first().element.tagName).toBe('BUTTON');
        expect(first().attributes()).toMatchObject({
            type: 'button', 'aria-label': 'Choose image 1', 'aria-pressed': 'true',
        });

        await first().trigger('click');

        expect(first().attributes('aria-pressed')).toBe('false');
        await expect(wrapper.vm.save()).resolves.toEqual([{ url: urls[1] }, { url: urls[2] }]);
    });

    it('takes the texts from the prop labels, with {index} for the number of the image', async () => {
        const wrapper = mountCropGram({
            labels: { add: 'Bilder hinzufügen', image: 'Bild {index}', choose: 'Bild {index} auswählen' },
        });
        await nextTick();

        expect(wrapper.find('.cg-btn-upload').attributes('aria-label')).toBe('Bilder hinzufügen');
        expect(wrapper.findAll('.roll-element img')[1].attributes('alt')).toBe('Bild 2');
        expect(orderButtons(wrapper)[2].attributes('aria-label')).toBe('Bild 3 auswählen');
    });

    it('keeps the default for a label that the prop labels leaves out', async () => {
        const wrapper = mountCropGram({ labels: { add: 'Bilder hinzufügen' } });
        await nextTick();

        expect(wrapper.findAll('.roll-element img')[0].attributes('alt')).toBe('Image 1');
    });

    it('hides the drawn order circle and number from screen readers', async () => {
        const wrapper = mountCropGram();
        await nextTick();

        expect(orderButtons(wrapper)[0].find('.reo-wrapper').attributes('aria-hidden')).toBe('true');
    });
});
