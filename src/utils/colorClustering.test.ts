import { describe, it, expect } from 'vitest';
import { kMeans, rgbToHex } from './colorClustering';

describe('rgbToHex', () => {
    it('converts black', () => {
        expect(rgbToHex([0, 0, 0])).toBe('#000000');
    });

    it('converts white', () => {
        expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
    });

    it('converts a color with single-digit hex values', () => {
        expect(rgbToHex([1, 2, 3])).toBe('#010203');
    });

    it('converts a typical skin tone', () => {
        expect(rgbToHex([196, 149, 106])).toBe('#c4956a');
    });
});

describe('kMeans', () => {
    it('returns k centroids', () => {
        const pixels = [
            [255, 0, 0],
            [254, 1, 0],
            [0, 255, 0],
            [1, 254, 0],
            [0, 0, 255],
            [0, 1, 254],
        ];
        const result = kMeans(pixels, 3);
        expect(result).toHaveLength(3);
    });

    it('finds obvious clusters', () => {
        // Three clearly separated clusters with many points
        const reds = Array.from({ length: 100 }, () => [220, 20, 20]);
        const greens = Array.from({ length: 100 }, () => [20, 220, 20]);
        const blues = Array.from({ length: 100 }, () => [20, 20, 220]);
        const pixels = [...reds, ...greens, ...blues];

        const centroids = kMeans(pixels, 3);

        // Each centroid should have one dominant channel
        const hasRedish = centroids.some((c) => c[0] > 150 && c[1] < 100 && c[2] < 100);
        const hasGreenish = centroids.some((c) => c[1] > 150 && c[0] < 100 && c[2] < 100);
        const hasBlueish = centroids.some((c) => c[2] > 150 && c[0] < 100 && c[1] < 100);

        expect(hasRedish).toBe(true);
        expect(hasGreenish).toBe(true);
        expect(hasBlueish).toBe(true);
    });

    it('handles empty pixel array', () => {
        const result = kMeans([], 3);
        expect(result).toHaveLength(3);
        result.forEach((c) => {
            expect(c).toEqual([128, 128, 128]);
        });
    });

    it('handles fewer pixels than k', () => {
        const pixels = [[100, 100, 100]];
        const result = kMeans(pixels, 3);
        expect(result).toHaveLength(1);
    });

    it('converges to stable centroids', () => {
        const pixels = Array.from({ length: 100 }, () => [150, 100, 50]);
        const centroids = kMeans(pixels, 1);
        expect(centroids[0]).toEqual([150, 100, 50]);
    });

    it('produces consistent results for tight clusters', () => {
        // Two tight clusters
        const cluster1 = Array.from({ length: 50 }, () => [100, 50, 50]);
        const cluster2 = Array.from({ length: 50 }, () => [50, 100, 50]);
        const pixels = [...cluster1, ...cluster2];

        const centroids = kMeans(pixels, 2);
        expect(centroids).toHaveLength(2);

        // Sort by R channel for deterministic comparison
        const sorted = [...centroids].sort((a, b) => a[0] - b[0]);
        expect(sorted[0]).toEqual([50, 100, 50]);
        expect(sorted[1]).toEqual([100, 50, 50]);
    });
});
