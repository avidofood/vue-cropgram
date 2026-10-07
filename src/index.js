import component from './CropGram.vue';

export const Plugin = {
    install(app) {
        // The PascalCase name also works as <crop-gram> in templates
        app.component('CropGram', component);
    },
};

export default component;
