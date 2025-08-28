import { useState, useMemo } from 'react';
import HexCluster from './HexCluster';
import ImagePreview from './ImagePreview';
import Together from 'together-ai';
import { colorPalettePrompt } from '../prompts/colorPalettePrompt';
import Markdown from 'react-markdown';

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
    const [paletteSuggestion, setPaletteSuggestion] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [colorSuggestions, setColorSugestions] =
        useState<Array<string> | null>(null);

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

            const suggestions = response.choices?.[0]?.message?.content;

            const cleaned = suggestions?.replace(/\/\/.*?\/\/\s*/s, '');
            setPaletteSuggestion(cleaned ?? 'No suggestion');

            const firstMarkerEnd = suggestions?.indexOf('//', 2);
            const arrayString = suggestions?.slice(2, firstMarkerEnd);
            console.log(arrayString);
            setColorSugestions(JSON.parse(arrayString || ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div>
                {hexCluster && (
                    <HexCluster
                        cluster={hexCluster}
                        title="detected skin tones"
                    />
                )}
            </div>
            {faceOutlined && !colorSuggestions && (
                <button
                    className=" w-[200px] cursor-pointer bg-indigo-600 text-white px-4 py-2 shadow hover:bg-indigo-700"
                    onClick={handleClick}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'find my palette!'}
                </button>
            )}
            {colorSuggestions && (
                <>
                    <HexCluster
                        cluster={colorSuggestions}
                        title="your colors!"
                    />
                    <div className="flex flex-col gap-1 indent-4 w-full max-w-[800px] mx-auto break-words text-md text-justify">
                        <Markdown>{paletteSuggestion}</Markdown>
                    </div>
                </>
            )}
            {faceOutlined && <div>Face detected! ✅</div>}
            <div className="flex flex-col-reverse md:flex-row gap-1 justify-center items-center">
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
        </div>
    );
}

export default PaletteFinderResults;
