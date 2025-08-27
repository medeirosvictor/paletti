import { useState, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

type FaceDetectionResult = { file?: File; error?: string };

export function useFaceDetection() {
    const [croppedImage, setCroppedImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
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

                const landmarks = detection.landmarks;
                const jawPoints = landmarks.getJawOutline();

                // Get bounding rectangle of jaw
                const minX = Math.min(...jawPoints.map((p) => p.x));
                const minY = Math.min(...jawPoints.map((p) => p.y));
                const maxX = Math.max(...jawPoints.map((p) => p.x));
                const maxY = Math.max(...jawPoints.map((p) => p.y));

                const padding = 5;
                const originalWidth = maxX - minX + padding * 2;
                const originalHeight = maxY - minY + padding * 2;

                // Calculate scale factor to fit max 300x300
                const maxSize = 300;
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

                // Clip jaw region
                ctx.save();
                ctx.beginPath();
                jawPoints.forEach((pt, i) => {
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

                // Convert canvas to File
                const blob: Blob = await new Promise((resolve) =>
                    canvas.toBlob((b) => resolve(b!), 'image/png')
                );

                const croppedFile = new File(
                    [blob],
                    file.name.replace(/\.\w+$/, '.png'),
                    { type: 'image/png' }
                );

                setCroppedImage(croppedFile);
                return { file: croppedFile };
            } catch (err) {
                const message = (err as Error).message;
                setError(message);
                return { error: message };
            }
        },
        [loadModels]
    );

    return { croppedImage, error, loadModels, detectAndCropFace };
}
