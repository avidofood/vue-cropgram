/**
 * Loads an image file into an image element. The object URL is revoked after the load,
 * the element keeps the image.
 *
 * @return {Promise<HTMLImageElement>}
 */
export default function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`vue-cropgram: the browser could not load ${file.name}`));
        };
        img.src = url;
    });
}
