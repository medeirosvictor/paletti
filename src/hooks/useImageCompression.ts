import imageCompression, { type Options } from 'browser-image-compression';
import { useCallback, useState } from 'react';

export function useImageCompression(defaultOptions?: Options) {
    const [error, setError] = useState<Error | null>(null);

    const compressImage = useCallback(
        async (imageFile: File, options?: Options) => {
            setError(null);

            try {
                const compressedFile = await imageCompression(imageFile, {
                    ...defaultOptions,
                    ...options,
                });

                return compressedFile;
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        [defaultOptions]
    );

    return { compressImage, error };
}
