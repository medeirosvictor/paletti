import { useState, useCallback, useRef, useEffect } from 'react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
                    audio: false,
                });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onplaying = () => setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Camera access denied');
                }
            }
        })();

        return () => {
            cancelled = true;
            stopStream();
        };
    }, [stopStream]);

    const handleCapture = useCallback(() => {
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
            const file = new File([blob], 'camera-capture.png', { type: 'image/png' });
            stopStream();
            onCapture(file);
        }, 'image/png');
    }, [onCapture, stopStream]);

    const handleClose = useCallback(() => {
        stopStream();
        onClose();
    }, [onClose, stopStream]);

    if (error) {
        return (
            <div className="flex flex-col items-center gap-3">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center max-w-md border border-red-200">
                    <p className="font-semibold">Camera unavailable</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="cursor-pointer bg-gray-400 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-gray-500 transition-colors font-medium"
                >
                    ✕ Close
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-teal-500">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-teal-400 rounded-full animate-spin" />
                        <p className="text-white/80 text-sm mt-3 font-medium">Opening camera…</p>
                    </div>
                )}
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
                    onClick={handleCapture}
                    disabled={loading}
                    className="cursor-pointer bg-teal-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    📸 Capture
                </button>
                <button
                    type="button"
                    onClick={handleClose}
                    className="cursor-pointer bg-gray-400 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-gray-500 transition-colors font-medium"
                >
                    ✕ Cancel
                </button>
            </div>
        </div>
    );
}

export default CameraCapture;
