import { useState, useMemo } from 'react';
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
            setPaletteSuggestion(
                response.choices?.[0]?.message?.content ?? 'No suggestion'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
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
                className=" w-[200px] cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
                onClick={handleClick}
            >
                Get my color pallet
            </button>
            <div className="text-left mx-auto">{paletteSuggestion}</div>
        </div>
    );
}

export default PaletteFinderResults;
