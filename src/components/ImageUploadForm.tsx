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
            setPreview(URL.createObjectURL(croppedFaceFile));
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
                <div>
                    <label htmlFor="imageIUploadInput">Upload file</label>
                    <input
                        id="imageUploadInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer w-full text-sm text-gray-600 border-2 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="imageCameraInput">Take a picture</label>
                    <input
                        id="imageCameraInput"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="cursor-pointer w-full text-sm text-gray-600 border-2 rounded-md p-2"
                        onChange={handleFileChange}
                    />
                </div>

                <button
                    type="submit"
                    className="cursor-pointer bg-emerald-700 p-2 rounded-md text-white hover:bg-emerald-500"
                >
                    FASHION ME
                </button>
            </form>

            <div>{preview && <ImagePreview src={preview} />}</div>
        </>
    );
};

export default ImageUploadForm;
