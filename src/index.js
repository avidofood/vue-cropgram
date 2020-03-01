import component from './CropGram.vue';

export const Plugin = {
    install(Vue) {
        Vue.component('crop-gram', component);
    },
};

export default component;
