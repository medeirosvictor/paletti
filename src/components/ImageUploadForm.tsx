import {
    useState,
    useEffect,
    useCallback,
    useRef,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import { useImageCompression } from '../hooks/useImageCompression';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { getFacePixels, kMeans, rgbToHex } from '../utils/colorClustering';
import { usePalette } from '../context/PaletteContext';
import ProcessingIndicator from './ProcessingIndicator';

const ImageUploadForm = () => {
    const {
        imageUploaded,
        faceDetected,
        processingStep,
        setImageUploaded,
        setFaceOutlined,
        setHexCluster,
        setFaceDetected,
        setProcessingStep,
        setError,
        resetForNewImage,
    } = usePalette();

    const [file, setFile] = useState<File | null>(null);

    // Camera state
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const { compressImage } = useImageCompression({
        maxSizeMB: 3,
        maxWidthOrHeight: 1980,
    });
    const { detectAndCropFace } = useFaceDetection();

    useEffect(() => {
        return () => {
            if (imageUploaded) URL.revokeObjectURL(imageUploaded);
        };
    }, [imageUploaded]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const updateImageUploaded = useCallback(
        (file: File) => {
            if (imageUploaded) URL.revokeObjectURL(imageUploaded);
            const url = URL.createObjectURL(file);
            setImageUploaded(url);
            return url;
        },
        [imageUploaded, setImageUploaded]
    );

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.currentTarget.files?.[0];
            if (!selectedFile) return;

            setFile(selectedFile);
            updateImageUploaded(selectedFile);
            resetForNewImage();
        },
        [updateImageUploaded, resetForNewImage]
    );

    // --- Camera ---

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setCameraOpen(false);
        setCameraError(null);
    }, []);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                audio: false,
            });
            streamRef.current = stream;
            setCameraOpen(true);
            requestAnimationFrame(() => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Camera access denied';
            setCameraError(message);
        }
    }, []);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video || !streamRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const capturedFile = new File([blob], 'camera-capture.png', { type: 'image/png' });
            setFile(capturedFile);
            updateImageUploaded(capturedFile);
            resetForNewImage();
            stopCamera();
        }, 'image/png');
    }, [updateImageUploaded, resetForNewImage, stopCamera]);

    // --- Processing ---

    const fileToCanvas = useCallback(async (file: File) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        await new Promise((res) => (img.onload = res));
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
        return canvas;
    }, []);

    const extractDominantColors = useCallback(
        async (file: File) => {
            const canvas = await fileToCanvas(file);
            const facePixels = getFacePixels(canvas);
            return kMeans(facePixels, 5).map(rgbToHex);
        },
        [fileToCanvas]
    );

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (!file) return;
            setError(null);

            try {
                setProcessingStep('compressing');
                const compressed = await compressImage(file);
                if (!compressed) {
                    setError('Image compression failed. Try a different photo.');
                    setProcessingStep('error');
                    return;
                }
                setFile(compressed);
                updateImageUploaded(compressed);

                setProcessingStep('detecting');
                const { file: croppedFaceFile, error } = await detectAndCropFace(compressed);
                if (!croppedFaceFile) {
                    setFaceDetected(false);
                    setError(error || 'Face not detected');
                    setProcessingStep('error');
                    return;
                }

                const faceUrl = URL.createObjectURL(croppedFaceFile);
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
        [file, updateImageUploaded, detectAndCropFace, setFaceOutlined, setHexCluster, setFaceDetected, extractDominantColors, compressImage, setProcessingStep, setError]
    );

    const isProcessing = processingStep !== 'idle' && processingStep !== 'done' && processingStep !== 'error';

    return (
        <form
            className="flex flex-col justify-center items-center gap-4"
            onSubmit={handleSubmit}
        >
            {/* Upload / Camera buttons */}
            {!cameraOpen && (
                <div className="flex flex-col sm:flex-row text-center gap-3">
                    <label
                        htmlFor="imageUploadInput"
                        className="cursor-pointer bg-violet-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-violet-700 transition-colors font-medium"
                    >
                        📁 Upload Photo
                    </label>
                    <input
                        hidden
                        id="imageUploadInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button
                        type="button"
                        onClick={startCamera}
                        className="cursor-pointer bg-teal-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-teal-700 transition-colors font-medium"
                    >
                        📷 Use Camera
                    </button>
                </div>
            )}

            {/* Camera error */}
            {cameraError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center max-w-md border border-red-200">
                    <p className="font-semibold">Camera unavailable</p>
                    <p className="text-sm mt-1">{cameraError}</p>
                </div>
            )}

            {/* Camera viewfinder */}
            {cameraOpen && (
                <div className="flex flex-col items-center gap-3">
                    <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-teal-500">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-72 h-72 object-cover -scale-x-100"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="cursor-pointer bg-teal-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-teal-700 transition-colors font-medium"
                        >
                            📸 Capture
                        </button>
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="cursor-pointer bg-gray-400 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-gray-500 transition-colors font-medium"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Processing indicator */}
            {isProcessing && <ProcessingIndicator step={processingStep} />}

            {/* Face detection error */}
            {faceDetected === false && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center max-w-md border border-red-200">
                    <p className="font-semibold text-lg">Face not detected!</p>
                    <p className="text-sm mt-1">
                        Try removing accessories and having only one person in the frame 😊
                    </p>
                </div>
            )}

            {/* Detect Face button */}
            {imageUploaded && faceDetected === null && !cameraOpen && !isProcessing && (
                <button
                    type="submit"
                    className="cursor-pointer bg-amber-500 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-amber-600 transition-colors font-medium"
                >
                    Detect Face
                </button>
            )}
        </form>
    );
};

export default ImageUploadForm;
