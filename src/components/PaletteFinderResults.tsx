import React, { useState, useMemo } from 'react';
import HexCluster from './HexCluster';
import ImagePreview from './ImagePreview';
import Together from 'together-ai';
import { colorPalettePrompt } from '../prompts/colorPalettePrompt';

type Props = {
    imageUploaded: string;
    faceOutlined: string;
    hexCluster: Array<string> | null;
};

function PaletteFinderResults({
    imageUploaded,
    faceOutlined,
    hexCluster,
}: Props) {
    const [paletteSuggestion, setPaletteSuggestion] = useState<string | null>(
        null
    );
    const [loading, setLoading] = useState(false);

    const together = useMemo(
        () =>
            new Together({
                apiKey: import.meta.env.VITE_TOGETHERAI_API_KEY,
            }),
        []
    );

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await together.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: `${colorPalettePrompt} ${hexCluster}`,
                    },
                ],
                model: 'openai/gpt-oss-120b',
            });
            setPaletteSuggestion(response.choices[0].message.content);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <div>{hexCluster && <HexCluster cluster={hexCluster} />}</div>
            <div className="flex gap-1 justify-center items-center">
                <div>
                    {imageUploaded && (
                        <ImagePreview
                            src={imageUploaded}
                            title="Image Uploaded"
                        />
                    )}
                </div>
                <div>
                    {faceOutlined && (
                        <ImagePreview src={faceOutlined} title="Face Outline" />
                    )}
                </div>
            </div>
            <button
                className="cursor-pointer border-1 p-3 my-3"
                onClick={handleClick}
            >
                Get my color pallet
            </button>
            <div>{paletteSuggestion}</div>
        </div>
    );
}

export default PaletteFinderResults;
