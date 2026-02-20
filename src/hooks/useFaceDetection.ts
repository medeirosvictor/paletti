import { useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

type FaceDetectionResult = { file?: File; error?: string };

/**
 * Build a full face outline by combining the jaw contour with a
 * forehead arc derived from the eyebrow landmarks.
 *
 * The 68-point landmark model gives us:
 * - Jaw outline: points 0–16 (ear to ear, U-shape)
 * - Left eyebrow: points 17–21
 * - Right eyebrow: points 22–26
 *
 * The jaw alone misses the forehead. We close the loop by creating
 * an arc above the eyebrows, connecting jaw point 16 back to jaw point 0.
 */
function buildFullFaceOutline(landmarks: faceapi.FaceLandmarks68) {
    const jaw = landmarks.getJawOutline();            // points 0–16
    const leftBrow = landmarks.getLeftEyeBrow();      // points 17–21
    const rightBrow = landmarks.getRightEyeBrow();    // points 22–26

    // Estimate forehead height: distance from mid-brow to nose bridge,
    // projected upward by roughly the same amount
    const midBrowY = Math.min(
        ...leftBrow.map((p) => p.y),
        ...rightBrow.map((p) => p.y)
    );
    const noseBridge = landmarks.getNose()[0]; // top of nose
    const browToNose = noseBridge.y - midBrowY;
    const foreheadOffset = browToNose * 1.4; // extend above brows

    // Build forehead arc points from right brow → left brow (reversed so
    // the outline goes clockwise: jaw left→right, then forehead right→left)
    const browPoints = [...rightBrow.slice().reverse(), ...leftBrow.slice().reverse()];
    const foreheadArc = browPoints.map((p) => ({
        x: p.x,
        y: p.y - foreheadOffset,
    }));

    // Full outline: jaw (0→16) + forehead arc (right side → left side)
    const outline = [
        ...jaw.map((p) => ({ x: p.x, y: p.y })),
        ...foreheadArc,
    ];

    return outline;
}

export function useFaceDetection() {
    const modelsLoadedRef = useRef(false);

    const loadModels = useCallback(async () => {
        if (!modelsLoadedRef.current) {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            ]);
            modelsLoadedRef.current = true;
        }
    }, []);

    const detectAndCropFace = useCallback(
        async (file: File): Promise<FaceDetectionResult> => {
            try {
                await loadModels();

                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                await new Promise((res) => (img.onload = res));

                const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks();

                if (!detection) return { error: 'No face detected' };

                const faceOutline = buildFullFaceOutline(detection.landmarks);

                // Bounding box of the full outline
                const minX = Math.min(...faceOutline.map((p) => p.x));
                const minY = Math.min(...faceOutline.map((p) => p.y));
                const maxX = Math.max(...faceOutline.map((p) => p.x));
                const maxY = Math.max(...faceOutline.map((p) => p.y));

                const padding = 10;
                const originalWidth = maxX - minX + padding * 2;
                const originalHeight = maxY - minY + padding * 2;

                // Scale to fit max 400x400
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

                // Clip to face outline
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

                // Draw scaled image
                ctx.drawImage(
                    img,
                    -minX * scale + padding * scale,
                    -minY * scale + padding * scale,
                    img.width * scale,
                    img.height * scale
                );
                ctx.restore();

                URL.revokeObjectURL(img.src);

                // Convert canvas to File
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
                const message = (err as Error).message;
                return { error: message };
            }
        },
        [loadModels]
    );

    return { detectAndCropFace };
}
