# Vue-Cropgram: Upload Images like in Instagram 🖼

<a href="https://www.npmjs.com/package/vue-cropgram">
  <img src="https://img.shields.io/npm/dt/vue-cropgram.svg" alt="Downloads">
</a>
<a href="https://www.npmjs.com/package/vue-cropgram">
  <img src="https://img.shields.io/npm/v/vue-cropgram.svg" alt="Version">
</a>
<a href="https://www.npmjs.com/package/vue-cropgram">
  <img src="https://img.shields.io/npm/l/vue-cropgram.svg" alt="License">
</a>

<a href="https://avidofood.github.io/vue-cropgram"><img src="/images/intro.png" width="400" alt="try it out" /></a>

**If you are only looking to crop images like in Instagram, please visit https://github.com/avidofood/vue-instagram-cropper 😜**

## Installation in 2 Steps

### 1: Add with npm 💻
```bash
 npm install vue-cropgram
```

### 2a: Install as a component

```javascript
 import CropGram from 'vue-cropgram'

 Vue.component('crop-gram', CropGram);
```
### 2b: Install as a plugin 
```javascript
 import { Plugin } from 'vue-cropgram'

 Vue.use(Plugin);
```

## Usage - (or to make it runnable 🏃‍♂️)


### Easiest version 🔍

```html
 <crop-gram ref="cropgram"></crop-gram>
```

### Advanced version 🌐

Just an example: 
```html
 <crop-gram
   ref="cropgram"
   canvas-color="#F7F7F7"
   placeholder-color="#67ACFD"
   selection-text-class="px-2 mb-1 text-left small-9 text-uppercase text-primary2 spacing-05"
   force-cache-break
   selection-text="Choosen images"
   placeholder="Choose an image"
   :items="pictures"
   :show-cropper="currentTab == 'pictures'"
   :placeholder-font-size="16"
   :file-size-limit="20000 * 1024"
   @init="$emit('init')"
   @set-view="currentTab = 'pictures'"
>
   <shows-instagram-feed-as-an-example
      v-show="currentTab == 'instagram'"
      :has-token="hasToken"
   />
</crop-gram>
```

### Demo ⚡️

https://avidofood.github.io/vue-cropgram

## Props

IMPORTANT: This package contains the props of https://avidofood.github.io/vue-instagram-cropper as well. Please have a check!

### Props values

- `showCropper` (default: `true`, type: Boolean)

Perfect to hide the cropper, but still shows the selected images. Usefull, when you want to show something else.

- `items` (default: `[]`, type: Array)

Contains all your pictures you want to contain. Important, they must be valid URLs. Visit the demo page to have a look.

- `mimeType` (default: `image/jpeg`, type: String)
- `compression` (default: `0.8`, type: Number)
- `selectionText` (default: `Chosen Images`, type: String)
- `selectionTextClass` (default: `''`, type: String)
  
- `itemsLimit` (default: `4`, type: Number)
  
Limits how many images can be choosen.
 


## Events 

IMPORTANT: Same as for props, this package contains the events of https://avidofood.github.io/vue-instagram-cropper as well. Please have a check!

- `choose-file-button`: Emitted only when the Choose-File-Button was used.
- `set-view`: Emitted when the view was changed
- `limit-reached`: Emitted when the limit of `itemsLimit` was reached
- `has-changed`: Emitted when images are added, moved, zoomed in/out or the order changed.
- `thumbnail-error(index)`: Emitted when thumbnail is not loaded.

## Methods

You need to set `ref=cropgram` to the HTML tag `<crop-gram>`. After that you can call all methods like this `this.$refs.cropgram.save()`.

- `save()`: Results a promise with an array of objects. Contains `url` or `blob` as a result. Here is an example how you can send this to your backend:

```javascript
createFormData() {
   const result = await this.$refs.cropgram.save()

   const data = new FormData();
   //list of your pics
   result.forEach((picture, index) => {
         data.append(`media[${index}]`, picture.url || picture.blob);
   });
   return data;
},
```
- `getCurrentCropperThumbnail()`: Get's thumbnail of the current view
- `chooseFile()`: Choose a file
- `setView(id)`: Sets a view with index
- `addNewUrl(url)`: Sets an image via URL
 
## TODO

I have only limited time to develop this package further. It would mean a lot to me, if you would help me to improve it step by step. This package contains my cropper package that also has a todo list. Have a look: [vue-instagram-cropper](https://github.com/avidofood/vue-instagram-cropper#todo) and here is a small list, what is still missing for this package:

- If you want to use the slot in [vue-instagram-cropper](https://github.com/avidofood/vue-instagram-cropper#todo), we need to develiver the content there.
- If you have multiple images and you remove one, you will see in a tiny fraction the placeholder text.
- We need to lock the image aspect ratio. For that we need to add a the prop `forceAspect` but for [vue-instagram-cropper](https://github.com/avidofood/vue-instagram-cropper#todo). 
- Do we need private methods like in [vue-instagram-cropper](https://github.com/avidofood/vue-instagram-cropper)?
 
## Security

If you discover any security related issues, please don't email me. I'm afraid 😱. avidofood@protonmail.com

## Credits

Now comes the best part! 😍
This package is based on

 - https://github.com/zhanziyang/vue-croppa (but simplefied)

Oh come on. You read everything?? If you liked it so far, hit the ⭐️ button to give me a 🤩 face. 
