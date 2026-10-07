// The extension for the type of the blob. A browser can give image/png instead of the mimeType.
const EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
};

// The name of the chosen file, or the last part of the URL path. A data or blob URL has none.
const baseName = (item) => {
    if (item.name) return item.name;
    if (!item.url || /^(data|blob):/.test(item.url)) return '';

    try {
        const { pathname } = new URL(item.url, document.baseURI);
        return decodeURIComponent(pathname.slice(pathname.lastIndexOf('/') + 1));
    } catch (error) {
        return '';
    }
};

/**
 * The file name for the blob of an item, with the extension of the blob type.
 *
 * @return {string} [An empty string if the item has no name]
 */
export default function fileName(item, type) {
    const name = baseName(item);
    const extension = EXTENSIONS[type];

    if (!name || !extension) return name;

    const dot = name.lastIndexOf('.');

    return `${dot > 0 ? name.slice(0, dot) : name}.${extension}`;
}
