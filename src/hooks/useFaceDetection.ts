import { useState, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

type FaceDetectionResult = { file?: File; error?: string };

export function useFaceDetection() {
    const [croppedImage, setCroppedImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const modelsLoadedRef = useRef(false);

    const loadModels = useCallback(async () => {
        if (!modelsLoadedRef.current) {
            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
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

                const detection = await faceapi.detectSingleFace(img);

                if (!detection) return { error: 'No face detected' };

                const { x, y, width, height } = detection.box;
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

                const blob: Blob = await new Promise((resolve) =>
                    canvas.toBlob((b) => resolve(b!), 'image/jpeg')
                );
                const croppedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                });
                return { file: croppedFile };
            } catch (err) {
                return { error: (err as Error).message };
            }
        },
        []
    );

    return { croppedImage, error, loadModels, detectAndCropFace };
}
