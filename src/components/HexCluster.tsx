import { useState } from 'react';

type Props = {
    cluster: Array<string> | null;
    title: string;
};

function isLightColor(hex: string): boolean {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

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
                            className="relative w-[72px] h-[72px] rounded-xl flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                            style={{
                                backgroundColor: hex,
                                color: isLightColor(hex) ? '#000' : '#fff',
                            }}
                            aria-label={`Copy color ${hex}`}
                            title={`Click to copy ${hex}`}
                        >
                            {copiedIndex === index ? (
                                <span className="animate-toast text-[10px]">copied!</span>
                            ) : (
                                hex
                            )}
                        </button>
                    ))}
            </div>
        </div>
    );
}

export default HexCluster;
