
import Vue from 'vue';
import CropGram from '../../../src/index';

Vue.component('crop-gram', CropGram);

new Vue({ // eslint-disable-line no-new
    el: '#app',
    data() {
        return {
            pictures: [
                'https://scontent-frt3-2.cdninstagram.com/v/t51.2885-15/e35/p1080x1080/89688017_211400866607155_8599867881831442646_n.jpg?_nc_ht=scontent-frt3-2.cdninstagram.com&_nc_cat=107&_nc_ohc=e9pIqPJE8yUAX8petit&oh=228888b3cee1d533c0d8c28df1fcf5a8&oe=5E935DBD',
                'https://raw.githubusercontent.com/avidofood/vue-responsive-video-background-player/master/demo/public/images/hero-mobile%402.jpg',
            ],
        };
    },
});
