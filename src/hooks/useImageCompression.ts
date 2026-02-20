import imageCompression, { type Options } from 'browser-image-compression';
import { useCallback, useRef, useState } from 'react';

export function useImageCompression(defaultOptions?: Options) {
    const [error, setError] = useState<Error | null>(null);

    // Store options in a ref so the callback identity stays stable
    const optionsRef = useRef(defaultOptions);
    optionsRef.current = defaultOptions;

    const compressImage = useCallback(
        async (imageFile: File, options?: Options) => {
            setError(null);

            try {
                const compressedFile = await imageCompression(imageFile, {
                    ...optionsRef.current,
                    ...options,
                });

                return compressedFile;
            } catch (err) {
                setError(err as Error);
                return null;
            }
        },
        []
    );

    return { compressImage, error };
}
