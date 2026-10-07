import { mount } from '@vue/test-utils';
import CropGram from '../src/index';

export const urls = ['/images/a.jpg', '/images/b.jpg', '/images/c.jpg'];

export const mountCropGram = (props = {}, options = {}) => mount(CropGram, {
    props: {
        items: urls,
        ...props,
    },
    ...options,
});

export const cropperOf = (wrapper) => wrapper.findComponent({ name: 'InstagramCropper' });

export const thumbnails = (wrapper) => wrapper.findAll('.roll-element img');

export const orderBadges = (wrapper) => wrapper.findAll('.roll-element-order');

export const orderNumbers = (wrapper) => wrapper.findAll('.reo-number').map((badge) => badge.text());
