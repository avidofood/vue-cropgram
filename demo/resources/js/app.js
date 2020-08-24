
import Vue from 'vue';
import CropGram from '../../../src/index';

Vue.component('crop-gram', CropGram);

new Vue({ // eslint-disable-line no-new
    el: '#app',
    data() {
        return {
            pictures: [
                'https://images.unsplash.com/photo-1598276716690-89971c7ddaa9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
                'https://raw.githubusercontent.com/avidofood/vue-responsive-video-background-player/master/demo/public/images/hero-mobile%402.jpg',
            ],
        };
    },
});
