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
- The thumbnails and the order numbers are buttons (`button.roll-element-view` with the `img` inside, `button.roll-element-order`). The classes and the look are the same. CSS that selects `.roll-element > img` needs `.roll-element img`.
- The UMD build no longer contains the cropper. Load the UMD build of vue-instagram-cropper 2.x first. The global name of the UMD build is `VueCropgram`. In 1.x, it was `index`.

### Added

- TypeScript types for the props, the events, the methods, the result of `save()` and the plugin. The types also register `CropGram` as a global component for template type checks.
- The events of the cropper carry their arguments. For example, `file-choose`, `file-size-exceed` and `file-type-mismatch` carry the file. `init` carries the cropper, and `draw` carries the canvas context.
- Listeners for cropper events that CropGram does not emit itself, for example `@image-remove-onload`, reach the cropper.
- A section about the size of the cropper in the README ([#27](https://github.com/avidofood/vue-cropgram/issues/27)).
- Choose several files at once: with the prop `multiple`, the add button and `chooseFile()` open a file dialog for several files ([#5](https://github.com/avidofood/vue-cropgram/issues/5)). Each new image fills the cropper and is centered, as a chosen file in the cropper.
- A blob in the result of `save()` has a `name`: the name of the chosen file or the last part of the URL, with the extension of the blob type. Pass it to `FormData.append()`, which otherwise calls the file "blob".
- Accessibility: the thumbnails and the order numbers are buttons with names, so keyboard and screen reader users can use them. The order number has `aria-pressed` and, for a chosen image, a description with its place. The current thumbnail has `aria-current`. The add button has a name and keeps its focus ring for the keyboard. The prop `labels` sets the texts, for example in another language. It also sets the texts of the cropper (`canvas`, `remove`, `fullscreen`) and gives them to it.
- `addFiles(files)` adds image files, for example from your own drop zone. Files that do not fit emit the events of the cropper with the file, and the other files are added. For a file that does not load, `image-error` carries the file.

### Fixed

- `save()` uses the latest crop of the current image. Before, it used the crop from the last view change, so the last move or zoom was missing ([#6](https://github.com/avidofood/vue-cropgram/issues/6)).
- A click on the order number of a thumbnail no longer breaks `save()`. Before, `save()` failed with a `TypeError` in `drawImage` ([#6](https://github.com/avidofood/vue-cropgram/issues/6)).
- A moved or zoomed image from `items` gives a `Blob`. Before, `blob` was sometimes a pending promise.
- An unchanged image from `items` stays in the result of `save()` after you looked at it. Before, a view change removed it from the result.
- After you remove an image, the next image in the cropper does not count as changed. Before, `save()` returned a blob for it instead of its URL.
- Removing an image that is not chosen keeps the order of the chosen images. Before, all chosen images moved down one place, and the first one lost its place.
- While the cropper loads the image of a new view, `save()` uses the stored crop of that image.
- The add button has `type="button"`. Before, it submitted a `<form>` around the component.
- Fast view changes no longer give an image the crop of another image. Before, a second view change during the load of an image stored the crop of the previous image in the wrong item.
- `addNewUrl()` keeps the latest crop of the current image. Before, a moved image from `items` was missing in the result of `save()` after `addNewUrl()`.
- A `save()` in a `has-changed`, `move` or `zoom` listener includes the change. Before, the image was marked as changed after these events.
- Storing the crop of the current image no longer reloads the image in the cropper. Before, the previous image sometimes replaced a newly chosen file.
- A move back to the previous position counts as a change. An example is the bounce of the image back to the edge.
- The same URL twice in `items` gives two separate images. Before, the second item showed the crop of the first one.
- A relative URL in `items` loads from the base URL of the page, also with `forceCacheBreak`. The cropper gets an absolute URL with a fragment such as `#cropgram-1`.
- A move in the cropper without a current image no longer throws a `TypeError`.
- Photos from a phone camera show the right way up ([#7](https://github.com/avidofood/vue-cropgram/issues/7)). vue-instagram-cropper 2.x lets the browser apply the EXIF orientation. Before, the photo turned twice.

### Changed

- If the browser cannot create an image, `save()` rejects with an error. An example is a cropper without a size. Before, the result had `blob: null`.
- `chooseFile()` at `itemsLimit` emits `limit-reached` and opens no file dialog. Before, the chosen file replaced the current image in the cropper, and `save()` sometimes returned it in place of the current image.
- `vue` (`^3.2.0`) is a peer dependency.
- The package declares `"type": "commonjs"` and `"exports"` with `types` conditions.
- The build uses Vite 8. Tests use Vitest. Lint uses ESLint 9 and eslint-config-avidofood 4. The development tools need Node.js 22.22.2 or newer in the 22 line, or 24.15 or newer. The published files have no Node.js requirement.
- The CSS stays in the JavaScript file, as in 1.x. The styles are plain CSS instead of SCSS.
- `npm pack` and `npm publish` build `dist/` first (`prepack`). The repository no longer contains `dist/`.
- A `Release` workflow publishes version tags to npm with trusted publishing.
- The old build tools are removed: vue-cli, laravel-mix and babel. 122 Dependabot alerts were in these development tools. None of them reached the published package.
