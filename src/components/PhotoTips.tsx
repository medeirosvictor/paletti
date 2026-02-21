import { useState, useRef, useEffect } from 'react';

function PhotoTips() {
    const [open, setOpen] = useState(false);
    const tipRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative inline-block" ref={tipRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="cursor-pointer w-6 h-6 rounded-full bg-white/80 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors text-xs font-bold shadow-sm border border-gray-200 flex items-center justify-center"
                aria-label="Photo tips"
                title="Tips for a good photo"
            >
                ?
            </button>

            {open && (
                <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 p-4 text-left">
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95" />

                    <p className="text-xs font-semibold text-gray-700 mb-2">📸 Tips for best results</p>
                    <ul className="text-[11px] text-gray-600 space-y-1.5 leading-relaxed">
                        <li className="flex gap-1.5">
                            <span>☀️</span>
                            <span>Use <strong>neutral, even lighting</strong> — avoid harsh shadows or colored lights</span>
                        </li>
                        <li className="flex gap-1.5">
                            <span>🤳</span>
                            <span>Face the camera straight on, <strong>like a selfie</strong></span>
                        </li>
                        <li className="flex gap-1.5">
                            <span>🖼️</span>
                            <span>Use a <strong>plain, lighter background</strong> for better detection</span>
                        </li>
                        <li className="flex gap-1.5">
                            <span>👤</span>
                            <span>Only <strong>one person</strong> in the frame</span>
                        </li>
                        <li className="flex gap-1.5">
                            <span>🕶️</span>
                            <span>Remove <strong>sunglasses, hats</strong>, or anything covering your face</span>
                        </li>
                        <li className="flex gap-1.5">
                            <span>💄</span>
                            <span>Minimal or <strong>no makeup</strong> for the most accurate skin tone</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default PhotoTips;
