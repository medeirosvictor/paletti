import { useCallback, useRef } from 'react';
import { useImageCompression } from './useImageCompression';
import { getFacePixels, kMeans, rgbToHex } from '../utils/colorClustering';
import { usePalette } from '../context/PaletteContext';

/**
 * Lazily import face-api.js — only loaded when the user actually
 * triggers face detection, keeping the initial bundle small.
 */
type FaceApiModule = typeof import('face-api.js');
let faceApiPromise: Promise<FaceApiModule> | null = null;
function getFaceApi(): Promise<FaceApiModule> {
    if (!faceApiPromise) {
        faceApiPromise = import('face-api.js');
    }
    return faceApiPromise;
}

/**
 * Build a full face outline by combining the jaw contour with a
 * forehead arc derived from the eyebrow landmarks.
 */
function buildFullFaceOutline(landmarks: import('face-api.js').FaceLandmarks68) {
    const jaw = landmarks.getJawOutline();
    const leftBrow = landmarks.getLeftEyeBrow();
    const rightBrow = landmarks.getRightEyeBrow();

    const midBrowY = Math.min(
        ...leftBrow.map((p) => p.y),
        ...rightBrow.map((p) => p.y)
    );
    const noseBridge = landmarks.getNose()[0];
    const browToNose = noseBridge.y - midBrowY;
    const foreheadOffset = browToNose * 1.4;

    const browPoints = [...rightBrow.slice().reverse(), ...leftBrow.slice().reverse()];
    const foreheadArc = browPoints.map((p) => ({
        x: p.x,
        y: p.y - foreheadOffset,
    }));

    return [
        ...jaw.map((p) => ({ x: p.x, y: p.y })),
        ...foreheadArc,
    ];
}

/**
 * Hook that orchestrates the full image processing pipeline:
 * compress → detect face → crop → extract colors.
 *
 * Manages object URLs carefully to prevent memory leaks.
 */
export function useProcessImage() {
    const {
        setImageUploaded,
        setFaceOutlined,
        setHexCluster,
        setFaceDetected,
        setProcessingStep,
        setError,
    } = usePalette();

    const { compressImage } = useImageCompression({
        maxSizeMB: 3,
        maxWidthOrHeight: 1980,
    });

    const modelsLoadedRef = useRef(false);
    // Track all object URLs created during processing for cleanup
    const activeUrlsRef = useRef<Set<string>>(new Set());

    const createObjectUrl = useCallback((blob: Blob | File): string => {
        const url = URL.createObjectURL(blob);
        activeUrlsRef.current.add(url);
        return url;
    }, []);

    const revokeObjectUrl = useCallback((url: string) => {
        URL.revokeObjectURL(url);
        activeUrlsRef.current.delete(url);
    }, []);

    /** Revoke all tracked object URLs (used on reset) */
    const revokeAllUrls = useCallback(() => {
        for (const url of activeUrlsRef.current) {
            URL.revokeObjectURL(url);
        }
        activeUrlsRef.current.clear();
    }, []);

    const loadModels = useCallback(async () => {
        if (!modelsLoadedRef.current) {
            try {
                const faceapi = await getFaceApi();
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                ]);
                modelsLoadedRef.current = true;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                throw new Error(
                    `Failed to load face detection models. Check your connection and try again. (${message})`
                );
            }
        }
    }, []);

    const detectAndCropFace = useCallback(
        async (file: File): Promise<{ file?: File; error?: string }> => {
            try {
                await loadModels();
                const faceapi = await getFaceApi();

                const img = document.createElement('img');
                const imgUrl = createObjectUrl(file);
                img.src = imgUrl;
                await new Promise((res) => (img.onload = res));

                const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks();

                if (!detection) {
                    revokeObjectUrl(imgUrl);
                    return { error: 'No face detected' };
                }

                const faceOutline = buildFullFaceOutline(detection.landmarks);

                const minX = Math.min(...faceOutline.map((p) => p.x));
                const minY = Math.min(...faceOutline.map((p) => p.y));
                const maxX = Math.max(...faceOutline.map((p) => p.x));
                const maxY = Math.max(...faceOutline.map((p) => p.y));

                const padding = 10;
                const originalWidth = maxX - minX + padding * 2;
                const originalHeight = maxY - minY + padding * 2;

                const maxSize = 400;
                const scale = Math.min(
                    maxSize / originalWidth,
                    maxSize / originalHeight,
                    1
                );

                const canvasWidth = originalWidth * scale;
                const canvasHeight = originalHeight * scale;

                const canvas = document.createElement('canvas');
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                const ctx = canvas.getContext('2d')!;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                ctx.save();
                ctx.beginPath();
                faceOutline.forEach((pt, i) => {
                    const x = (pt.x - minX + padding) * scale;
                    const y = (pt.y - minY + padding) * scale;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(
                    img,
                    -minX * scale + padding * scale,
                    -minY * scale + padding * scale,
                    img.width * scale,
                    img.height * scale
                );
                ctx.restore();

                // Clean up the intermediate URL
                revokeObjectUrl(imgUrl);

                const blob: Blob = await new Promise((resolve) =>
                    canvas.toBlob((b) => resolve(b!), 'image/png')
                );

                const croppedFile = new File(
                    [blob],
                    file.name.replace(/\.\w+$/, '.png'),
                    { type: 'image/png' }
                );

                return { file: croppedFile };
            } catch (err) {
                return { error: (err as Error).message };
            }
        },
        [loadModels, createObjectUrl, revokeObjectUrl]
    );

    const fileToCanvas = useCallback(async (file: File) => {
        const img = document.createElement('img');
        const imgUrl = createObjectUrl(file);
        img.src = imgUrl;
        await new Promise((res) => (img.onload = res));
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        revokeObjectUrl(imgUrl);
        return canvas;
    }, [createObjectUrl, revokeObjectUrl]);

    const extractDominantColors = useCallback(
        async (file: File) => {
            const canvas = await fileToCanvas(file);
            const facePixels = getFacePixels(canvas);
            return kMeans(facePixels, 5).map(rgbToHex);
        },
        [fileToCanvas]
    );

    /** Run the full pipeline: compress → detect → extract */
    const processImage = useCallback(
        async (file: File) => {
            setError(null);

            try {
                setProcessingStep('compressing');
                const compressed = await compressImage(file);
                if (!compressed) {
                    setError('Image compression failed. Try a different photo.');
                    setProcessingStep('error');
                    return;
                }

                const uploadUrl = createObjectUrl(compressed);
                setImageUploaded(uploadUrl);

                setProcessingStep('detecting');
                const { file: croppedFaceFile, error } = await detectAndCropFace(compressed);
                if (!croppedFaceFile) {
                    setFaceDetected(false);
                    setError(error || 'Face not detected');
                    setProcessingStep('error');
                    return;
                }

                const faceUrl = createObjectUrl(croppedFaceFile);
                setFaceOutlined(faceUrl);
                setFaceDetected(true);

                setProcessingStep('extracting');
                const colors = await extractDominantColors(croppedFaceFile);
                setHexCluster(colors);

                setProcessingStep('done');
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Processing failed';
                setError(message);
                setProcessingStep('error');
            }
        },
        [
            compressImage,
            createObjectUrl,
            detectAndCropFace,
            extractDominantColors,
            setImageUploaded,
            setFaceOutlined,
            setHexCluster,
            setFaceDetected,
            setProcessingStep,
            setError,
        ]
    );

    return { processImage, revokeAllUrls, createObjectUrl };
}
