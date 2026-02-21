import { useState } from 'react';

function PhotoTips() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="cursor-pointer w-6 h-6 rounded-full bg-white/80 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors text-xs font-bold shadow-sm border border-gray-200 flex items-center justify-center"
                aria-label="Photo tips"
                title="Tips for a good photo"
            >
                ?
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-xs text-left relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
                            aria-label="Close tips"
                        >
                            ✕
                        </button>

                        <p className="text-sm font-semibold text-gray-700 mb-3">📸 Tips for best results</p>
                        <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
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

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="cursor-pointer mt-4 w-full bg-violet-600 text-white text-xs font-medium py-2 rounded-full hover:bg-violet-700 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default PhotoTips;
