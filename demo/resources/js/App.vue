<!-- eslint-disable max-len -->
<template>
    <section class="container">
        <div class="d-flex justify-content-center align-items-center px-2 py-4">
            <h4
                class="text-white text-center d-md-none"
                style="font-weight: 600;"
            >
                Vue CropGram
            </h4>
            <h1
                class="text-white d-none d-md-block"
                style="font-weight: 600;"
            >
                Vue CropGram
            </h1>
        </div>
    </section>

    <section class="container">
        <div class="d-flex justify-content-center align-items-center">
            <div class="bg-white p-4 rounded cropper-wrapper">
                <crop-gram
                    :items="pictures"
                    multiple
                    placeholder-color="#000000"
                    placeholder="Choose or Drag'n'Drop an image"
                    :placeholder-font-size="14"
                />
            </div>
        </div>
    </section>

    <section class="container text-center mt-3">
        <h6 class="text-light">
            Vue.js component
        </h6>
        <a
            class="btn btn-danger"
            href="https://github.com/avidofood/vue-cropgram"
            role="button"
        >Source on GitHub</a>

        <div class="social mt-4">
            <a
                href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                class="twitter-share-button"
                data-show-count="false"
            >Tweet</a>
            <a
                class="github-button"
                href="https://github.com/avidofood/vue-cropgram"
                data-show-count="true"
                aria-label="Star avidofood/vue-cropgram on GitHub"
            >Star</a>
        </div>
    </section>

    <section class="container mt-5">
        <div class="row">
            <div class="col-12 col-md-6">
                <h4
                    class="text-white d-md-none"
                    style="font-weight: 600;"
                >
                    Designed for Vue 3
                </h4>
                <h2
                    class="text-white d-none d-md-block"
                    style="font-weight: 600; "
                >
                    Designed for Vue 3
                </h2>
            </div>
            <div class="col-12 col-md-6">
                <p class="text-white">
                    It feels like the image uploader from Instagram. If you just need the cropper, visit <a
                        href="https://github.com/avidofood/vue-instagram-cropper"
                        class="text-danger font-weight-bold"
                    >Vue Instagram Cropper</a>.
                </p>
            </div>
        </div>
    </section>
</template>

<script setup>
import CropGram from '../../../src/index';

const pictures = [
    'https://images.unsplash.com/photo-1598276716690-89971c7ddaa9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
    'https://raw.githubusercontent.com/avidofood/vue-responsive-video-background-player/master/demo/public/images/hero-mobile%402.jpg',
];
</script>
