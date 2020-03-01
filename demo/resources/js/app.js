
import Vue from 'vue';
import CropGram from '../../../src/index';

Vue.component('crop-gram', CropGram);

new Vue({ // eslint-disable-line no-new
    el: '#app',
    data() {
        return {
            pictures: ['https://raw.githubusercontent.com/avidofood/vue-responsive-video-background-player/master/demo/public/images/hero-mobile%402.jpg'],
        };
    },
});
