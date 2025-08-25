import {
    useState,
    useEffect,
    type ChangeEvent,
    type FC,
    type FormEvent,
} from 'react';
import ImagePreview from './ImagePreview';
import { useImageCompression } from '../hooks/useImageCompression';
import { useFaceDetection } from '../hooks/useFaceDetection';

const ImageUploadForm: FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [faceDetected, setFaceDetected] = useState<string>('');
    const [pixelatedImage, setPixelatedImage] = useState<string>('');
    const [hexCluster, setHexCluster] = useState<string>('');
    const { compressImage } = useImageCompression({
        maxSizeMB: 3,
        maxWidthOrHeight: 1024,
    });

    const { croppedImage, error, loadModels, detectAndCropFace } =
        useFaceDetection();

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const onSubmitCompressImage = async (file: File): Promise<File> => {
        console.log('Original size MB:', (file.size / 1024 / 1024).toFixed(3));

        const compressedImage = await compressImage(file);
        if (!compressedImage) {
            console.error('Compression failed');
            return file;
        }

        console.log(
            'Compressed size MB:',
            (compressedImage.size / 1024 / 1024).toFixed(3)
        );

        return compressedImage;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const compressedImage = await onSubmitCompressImage(file);
        setFile(compressedImage);
        setPreview(URL.createObjectURL(compressedImage));

        const { file: croppedFaceFile, error: detectionError } =
            await detectAndCropFace(compressedImage);

        if (croppedFaceFile) {
            setFile(croppedFaceFile);
            setFaceDetected(URL.createObjectURL(croppedFaceFile));
        } else {
            console.error(detectionError);
        }
    };
    return (
        <>
            <form
                className="flex flex-col justify-center items-center gap-2"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col text-center gap-1">
                    <label
                        htmlFor="imageUploadInput"
                        className="cursor-pointer bg-violet-600 text-white px-4 py-2 rounded-lg shadow hover:bg-violet-700"
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

                {preview && (
                    <button
                        type="submit"
                        className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                    >
                        FIND MY COLOR PALETTE
                    </button>
                )}
            </form>

            <div>
                {faceDetected && (
                    <ImagePreview src={faceDetected} title="Face Detected" />
                )}
            </div>
            <div>
                {preview && (
                    <ImagePreview src={preview} title="Image Uploaded" />
                )}
            </div>
        </>
    );
};

export default ImageUploadForm;
