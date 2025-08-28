import {
    useState,
    useEffect,
    useCallback,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import { useImageCompression } from '../hooks/useImageCompression';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { getFacePixels, kMeans, rgbToHex } from '../hooks/getColorPalette';
import { type Dispatch, type SetStateAction } from 'react';

interface ImageUploadFormProps {
    imageUploaded: string;
    setImageUploaded: Dispatch<SetStateAction<string>>;
    setFaceOutlined: Dispatch<SetStateAction<string>>;
    setHexCluster: Dispatch<SetStateAction<string[] | null>>;
}

const ImageUploadForm = ({
    imageUploaded,
    setImageUploaded,
    setFaceOutlined,
    setHexCluster,
}: ImageUploadFormProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

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
            setFaceDetected(null);
            setHexCluster(null);
            setFaceOutlined('');
        },
        [updateImageUploaded, setFaceOutlined, setHexCluster]
    );

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
            return kMeans(facePixels, 3).map(rgbToHex);
        },
        [fileToCanvas]
    );

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (!file) return;
            setLoading(true);

            try {
                const compressed = await compressImage(file);
                if (!compressed) {
                    console.error('Compression failed');
                    return file;
                }
                setFile(compressed);
                updateImageUploaded(compressed);

                const { file: croppedFaceFile, error } =
                    await detectAndCropFace(compressed);
                if (!croppedFaceFile) {
                    setFaceDetected(false);
                    console.error(error);
                    return;
                }

                const faceUrl = URL.createObjectURL(croppedFaceFile);
                setFaceOutlined(faceUrl);
                setFaceDetected(true);

                const colors = await extractDominantColors(croppedFaceFile);
                setHexCluster(colors);
            } finally {
                setLoading(false);
            }
        },
        [
            file,
            updateImageUploaded,
            detectAndCropFace,
            setFaceOutlined,
            setHexCluster,
            extractDominantColors,
        ]
    );

    return (
        <form
            className="flex flex-col justify-center items-center gap-2"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col text-center gap-1">
                <label
                    htmlFor="imageUploadInput"
                    className="cursor-pointer bg-violet-600 text-white px-4 py-2 shadow hover:bg-violet-700"
                >
                    📷 Upload or Take Photo
                </label>
                <input
                    hidden
                    id="imageUploadInput"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                />
            </div>

            {faceDetected === false && (
                <div className="bg-red-500 text-white p-3 font-bold text-center text-xl">
                    Face not detected, try a different photo!
                    <p className="text-base font-normal">
                        Try removing accessories and only (one) person in the
                        frame hehe
                    </p>
                </div>
            )}

            {imageUploaded && faceDetected === null && (
                <button
                    type="submit"
                    className="cursor-pointer bg-amber-600 text-white px-4 py-2 shadow hover:bg-amber-700"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Detect Face'}
                </button>
            )}
        </form>
    );
};

export default ImageUploadForm;
