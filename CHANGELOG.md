# Changelog

This file lists the changes of version 2.x (Vue 3). Version 1.x (Vue 2) is on the `1x` branch.

## 2.0.0

Version 2.0 works with Vue 3. The README has a section "Migration from 1.x to 2.x" with the steps for your code.

### Breaking changes

- Vue 3.2 or newer is required. For Vue 2, use version 1.x: `npm install vue-cropgram@1x`.
- The cropper inside is vue-instagram-cropper 2.x, the Vue 3 version of the cropper.
- The plugin registers the component on the app as `CropGram`. The tag `<crop-gram>` still works.
- `class` and `style` stay on the root element. All other attributes and listeners go only to the cropper. In 1.x, other attributes were also on the root element and on the `<form>` around the cropper.
- The package files changed. The ES module is `dist/vue-cropgram.mjs`, the UMD and CommonJS build is `dist/vue-cropgram.umd.js`. The files `dist/index.common.js`, `dist/index.umd.js`, `dist/index.umd.min.js` and the folder `src/` are no longer in the package.
- The UMD build no longer contains the cropper. Load the UMD build of vue-instagram-cropper 2.x first. The global name of the UMD build is `VueCropgram`. In 1.x, it was `index`.

### Added

- TypeScript types for the props, the events, the methods, the result of `save()` and the plugin. The types also register `CropGram` as a global component for template type checks.
- The events of the cropper carry their arguments. For example, `file-choose`, `file-size-exceed` and `file-type-mismatch` carry the file. `init` carries the cropper, and `draw` carries the canvas context.
- Listeners for cropper events that CropGram does not emit itself, for example `@image-remove-onload`, reach the cropper.
- A section about the size of the cropper in the README ([#27](https://github.com/avidofood/vue-cropgram/issues/27)).

### Fixed

- `save()` uses the latest crop of the current image. Before, it used the crop from the last view change, so the last move or zoom was missing ([#6](https://github.com/avidofood/vue-cropgram/issues/6)).
- A click on the order number of a thumbnail no longer breaks `save()`. Before, `save()` failed with a `TypeError` in `drawImage` ([#6](https://github.com/avidofood/vue-cropgram/issues/6)).
- A moved or zoomed image from `items` gives a `Blob`. Before, `blob` was sometimes a pending promise.
- An unchanged image from `items` stays in the result of `save()` after you looked at it. Before, a view change removed it from the result.
- After you remove an image, the next image in the cropper does not count as changed. Before, `save()` returned a blob for it instead of its URL.
- Removing an image that is not chosen keeps the order of the chosen images. Before, all chosen images moved down one place, and the first one lost its place.
- While the cropper loads the image of a new view, `save()` uses the stored crop of that image.
- The add button has `type="button"`. Before, it submitted a `<form>` around the component.
- A move in the cropper without a current image no longer throws a `TypeError`.
- Photos from a phone camera show the right way up ([#7](https://github.com/avidofood/vue-cropgram/issues/7)). vue-instagram-cropper 2.x lets the browser apply the EXIF orientation. Before, the photo turned twice.

### Changed

- `vue` (`^3.2.0`) is a peer dependency.
- The package declares `"type": "commonjs"` and `"exports"` with `types` conditions.
- The build uses Vite 8. Tests use Vitest. Lint uses ESLint 9 and eslint-config-avidofood 4. The development tools need Node.js 22.12 or newer. The published files have no Node.js requirement.
- The CSS stays in the JavaScript file, as in 1.x. The styles are plain CSS instead of SCSS.
- `npm pack` and `npm publish` build `dist/` first (`prepack`). The repository no longer contains `dist/`.
- A `Release` workflow publishes version tags to npm with trusted publishing.
- The old build tools are removed: vue-cli, laravel-mix and babel. 122 Dependabot alerts were in these development tools. None of them reached the published package.
