import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
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
    const { compressImage } = useImageCompression({
        maxSizeMB: 3,
        maxWidthOrHeight: 1024,
    });

    const { croppedImage, error, loadModels, detectAndCropFace } =
        useFaceDetection();

    useEffect(() => {
        return () => {
            if (imageUploaded) URL.revokeObjectURL(imageUploaded);
        };
    }, [imageUploaded]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        setFile(file);
        setImageUploaded(URL.createObjectURL(file));
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
        setImageUploaded(URL.createObjectURL(compressedImage));

        const { file: croppedFaceFile, error: detectionError } =
            await detectAndCropFace(compressedImage);

        if (croppedFaceFile) {
            setFile(croppedFaceFile);
            setFaceOutlined(URL.createObjectURL(croppedFaceFile));

            const img = document.createElement('img');
            img.src = URL.createObjectURL(croppedFaceFile);
            await new Promise((res) => (img.onload = res));

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            const facePixels = getFacePixels(canvas);
            const dominantColors = kMeans(facePixels, 3).map(rgbToHex);
            setHexCluster(dominantColors);
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

                {imageUploaded && (
                    <button
                        type="submit"
                        className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                    >
                        FIND MY COLOR PALETTE
                    </button>
                )}
            </form>
        </>
    );
};

export default ImageUploadForm;
