/**
 * The src that the cropper gets for an image from the items prop.
 *
 * - An absolute URL, resolved like the browser does it. With forceCacheBreak, the cropper resolves
 *   a relative URL against the page URL and ignores a <base> element.
 * - A fragment with the key of the item. The browser does not send it, but the src is unique:
 *   the same URL twice in items gives two loads, and CropGram knows which item the cropper shows.
 *   A URL that already has a fragment stays as it is.
 */
export default function cropperUrl(item) {
    try {
        const url = new URL(item.url, document.baseURI);
        if (!url.hash) url.hash = `cropgram-${item.key}`;
        return url.href;
    } catch (error) {
        return item.url;
    }
}
