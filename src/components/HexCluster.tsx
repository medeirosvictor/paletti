import { useState } from 'react';
import { isLightColor, getColorName } from '../utils/colorHelpers';

type Props = {
    cluster: Array<string> | null;
    title: string;
};

function HexCluster({ cluster, title }: Props) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = async (hex: string, index: number) => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1200);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = hex;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1200);
        }
    };

    return (
        <div className="flex flex-col gap-2 my-4 items-center">
            <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
            <div className="flex flex-wrap justify-center gap-2">
                {cluster &&
                    cluster.map((hex, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleCopy(hex, index)}
                            className="relative w-[72px] h-[84px] rounded-xl flex flex-col items-center justify-center font-bold text-xs shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                            style={{
                                backgroundColor: hex,
                                color: isLightColor(hex) ? '#000' : '#fff',
                            }}
                            aria-label={`Copy color ${hex} (${getColorName(hex)})`}
                            title={`${getColorName(hex)} — click to copy ${hex}`}
                        >
                            {copiedIndex === index ? (
                                <span className="animate-toast text-[10px]">copied!</span>
                            ) : (
                                <>
                                    <span className="text-[9px] leading-tight opacity-80">{getColorName(hex)}</span>
                                    <span className="text-[10px]">{hex}</span>
                                </>
                            )}
                        </button>
                    ))}
            </div>
        </div>
    );
}

export default HexCluster;
