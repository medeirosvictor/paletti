export const getFacePixels = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data; // RGBA array
    const rgbPixels: number[][] = [];

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        if (a > 0) {
            rgbPixels.push([r, g, b]);
        }
    }
    return rgbPixels;
};

export const kMeans = (pixels: number[][], k = 3, maxIter = 10) => {
    // Random initial centroids
    let centroids = pixels.slice(0, k);

    for (let iter = 0; iter < maxIter; iter++) {
        const clusters: number[][][] = Array.from({ length: k }, () => []);

        // Assign pixels to nearest centroid
        pixels.forEach((pixel) => {
            let minDist = Infinity;
            let closest = 0;
            centroids.forEach((c, idx) => {
                const dist =
                    (c[0] - pixel[0]) ** 2 +
                    (c[1] - pixel[1]) ** 2 +
                    (c[2] - pixel[2]) ** 2;
                if (dist < minDist) {
                    minDist = dist;
                    closest = idx;
                }
            });
            clusters[closest].push(pixel);
        });

        // Update centroids
        centroids = clusters.map((cluster) => {
            if (!cluster.length) return [0, 0, 0];
            const sum = cluster.reduce(
                (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
                [0, 0, 0]
            );
            return sum.map((v) => Math.round(v / cluster.length)) as number[];
        });
    }

    return centroids;
};

export const rgbToHex = (rgb: number[]) =>
    '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
