import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { usePalette } from '../context/PaletteContext';
import { useProcessImage } from '../hooks/useProcessImage';
import CameraCapture from './CameraCapture';
import ProcessingIndicator from './ProcessingIndicator';

const ImageUploadForm = () => {
    const {
        imageUploaded,
        faceDetected,
        processingStep,
        resetForNewImage,
    } = usePalette();

    const { processImage } = useProcessImage();

    const [file, setFile] = useState<File | null>(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    // Track the local preview URL so we can revoke it
    const previewUrlRef = useRef<string | null>(null);

    const makePreviewUrl = useCallback((f: File) => {
        // Revoke previous preview URL
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }
        const url = URL.createObjectURL(f);
        previewUrlRef.current = url;
        return url;
    }, []);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.currentTarget.files?.[0];
            if (!selectedFile) return;
            setFile(selectedFile);
            setPreviewUrl(makePreviewUrl(selectedFile));
            resetForNewImage();
        },
        [resetForNewImage, makePreviewUrl]
    );

    const handleCameraCapture = useCallback(
        (capturedFile: File) => {
            setFile(capturedFile);
            setPreviewUrl(makePreviewUrl(capturedFile));
            resetForNewImage();
            setCameraOpen(false);
        },
        [resetForNewImage, makePreviewUrl]
    );

    const handleDetectFace = useCallback(async () => {
        if (!file) return;
        // Revoke the local preview — processImage will create tracked URLs
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        setPreviewUrl(null);
        await processImage(file);
    }, [file, processImage]);

    const isProcessing =
        processingStep !== 'idle' &&
        processingStep !== 'done' &&
        processingStep !== 'error';

    return (
        <div className="flex flex-col justify-center items-center gap-4">
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
                        onClick={() => setCameraOpen(true)}
                        className="cursor-pointer bg-teal-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-teal-700 transition-colors font-medium"
                    >
                        📷 Use Camera
                    </button>
                </div>
            )}

            {/* Camera */}
            {cameraOpen && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setCameraOpen(false)}
                />
            )}

            {/* Image preview with overlaid Detect Face button */}
            {previewUrl && !cameraOpen && !imageUploaded && !isProcessing && (
                <div className="relative inline-block">
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-white/70 backdrop-blur-md p-1">
                        <img
                            className="w-72 h-72 object-contain rounded-xl"
                            src={previewUrl}
                            alt="Selected photo"
                        />
                    </div>
                    {faceDetected === null && (
                        <button
                            type="button"
                            onClick={handleDetectFace}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer bg-amber-500 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-amber-600 transition-colors font-medium backdrop-blur-sm"
                        >
                            ✨ Detect Face
                        </button>
                    )}
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
        </div>
    );
};

export default ImageUploadForm;
