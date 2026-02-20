/**
 * Extract RGB pixels from a canvas, filtering out transparent,
 * near-black (shadows), and near-white (highlights) pixels.
 */
export const getFacePixels = (canvas: HTMLCanvasElement): number[][] => {
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data; // RGBA flat array
    const rgbPixels: number[][] = [];

    const MIN_BRIGHTNESS = 30;
    const MAX_BRIGHTNESS = 240;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a === 0) continue;

        // Filter shadow/highlight artifacts
        const brightness = (r + g + b) / 3;
        if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) continue;

        rgbPixels.push([r, g, b]);
    }

    return rgbPixels;
};

/** Squared Euclidean distance between two RGB pixels */
const distSq = (a: number[], b: number[]): number =>
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/**
 * K-Means++ initialization: pick centroids that are spread apart.
 */
const initCentroidsKMeansPP = (pixels: number[][], k: number): number[][] => {
    const centroids: number[][] = [];

    // First centroid: random pixel
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

    for (let c = 1; c < k; c++) {
        // For each pixel, find distance to nearest existing centroid
        const distances = pixels.map((pixel) => {
            let minDist = Infinity;
            for (const centroid of centroids) {
                const d = distSq(pixel, centroid);
                if (d < minDist) minDist = d;
            }
            return minDist;
        });

        // Weighted random selection: pixels farther from existing centroids are more likely
        const totalDist = distances.reduce((sum, d) => sum + d, 0);
        let target = Math.random() * totalDist;

        for (let i = 0; i < pixels.length; i++) {
            target -= distances[i];
            if (target <= 0) {
                centroids.push(pixels[i]);
                break;
            }
        }

        // Fallback in case of floating point issues
        if (centroids.length <= c) {
            centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
        }
    }

    return centroids;
};

/**
 * K-Means clustering with K-Means++ initialization and early convergence stopping.
 */
export const kMeans = (pixels: number[][], k = 3, maxIter = 20): number[][] => {
    if (pixels.length === 0) return Array.from({ length: k }, () => [128, 128, 128]);
    if (pixels.length <= k) return pixels.map((p) => [...p]);

    let centroids = initCentroidsKMeansPP(pixels, k);

    for (let iter = 0; iter < maxIter; iter++) {
        const clusters: number[][][] = Array.from({ length: k }, () => []);

        // Assign pixels to nearest centroid
        for (const pixel of pixels) {
            let minDist = Infinity;
            let closest = 0;
            for (let idx = 0; idx < centroids.length; idx++) {
                const d = distSq(centroids[idx], pixel);
                if (d < minDist) {
                    minDist = d;
                    closest = idx;
                }
            }
            clusters[closest].push(pixel);
        }

        // Compute new centroids
        const newCentroids = clusters.map((cluster, i) => {
            if (!cluster.length) return centroids[i]; // Keep old centroid if cluster is empty
            const sum = cluster.reduce(
                (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
                [0, 0, 0]
            );
            return sum.map((v) => Math.round(v / cluster.length));
        });

        // Check convergence: stop if centroids didn't move
        const converged = newCentroids.every(
            (nc, i) => distSq(nc, centroids[i]) < 1
        );

        centroids = newCentroids;

        if (converged) break;
    }

    return centroids;
};

export const rgbToHex = (rgb: number[]): string =>
    '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
