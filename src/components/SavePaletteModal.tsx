import { useState, useRef, useEffect } from 'react';

interface Props {
    open: boolean;
    onSave: (name: string) => void;
    onCancel: () => void;
}

function SavePaletteModal({ open, onSave, onCancel }: Props) {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setName('');
            // Focus after render
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl w-full max-w-sm flex flex-col gap-4"
            >
                <h2 className="text-lg font-bold text-gray-700">Save Palette</h2>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Look, Date Night..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    maxLength={50}
                />
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer px-4 py-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="cursor-pointer px-5 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
                    >
                        💾 Save
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SavePaletteModal;
