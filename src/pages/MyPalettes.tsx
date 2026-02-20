import { useState, useEffect } from 'react';
import { getSavedPalettes, deletePalette, clearAllPalettes, type SavedPalette } from '../utils/paletteHistory';
import { exportPaletteAsPng } from '../utils/exportPalette';

function isLightColor(hex: string): boolean {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function MyPalettes() {
    const [palettes, setPalettes] = useState<SavedPalette[]>([]);

    useEffect(() => {
        setPalettes(getSavedPalettes());
    }, []);

    const handleDelete = (id: string) => {
        deletePalette(id);
        setPalettes(getSavedPalettes());
    };

    const handleClearAll = () => {
        if (confirm('Delete all saved palettes?')) {
            clearAllPalettes();
            setPalettes([]);
        }
    };

    const handleExport = (palette: SavedPalette) => {
        exportPaletteAsPng(palette.skinTones, palette.suggestions, palette.name);
    };

    if (palettes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 shadow-lg text-center">
                    <p className="text-6xl mb-4">🎨</p>
                    <p className="text-xl font-medium text-gray-600">No saved palettes yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Generate a palette on the home page and click "Save Palette" to see it here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">My Palettes</h1>
                <button
                    onClick={handleClearAll}
                    className="cursor-pointer text-sm text-red-200 hover:text-red-100 transition-colors backdrop-blur-sm bg-red-500/20 px-3 py-1 rounded-full"
                >
                    Clear all
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {palettes.map((palette) => (
                    <div
                        key={palette.id}
                        className="bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-lg flex flex-col gap-3"
                    >
                        {/* Name & Date */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                {palette.name || 'Untitled Palette'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(palette.timestamp).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        {/* Skin tones */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 mb-1">Skin Tones</p>
                            <div className="flex gap-1">
                                {palette.skinTones.map((hex, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-lg shadow-sm"
                                        style={{ backgroundColor: hex }}
                                        title={hex}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Season colors */}
                        <div className="flex flex-col gap-2">
                            {Object.entries(palette.suggestions.seasons).map(([season, colors]) =>
                                colors.length > 0 && (
                                    <div key={season}>
                                        <p className="text-xs font-medium text-gray-400 capitalize mb-1">{season}</p>
                                        <div className="flex gap-1">
                                            {colors.map((hex, i) => (
                                                <div
                                                    key={i}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                                                    style={{
                                                        backgroundColor: hex,
                                                        color: isLightColor(hex) ? '#000' : '#fff',
                                                    }}
                                                    title={hex}
                                                >
                                                    <span className="text-[6px] font-bold">{hex}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Jewelry */}
                        {palette.suggestions.jewelry && (
                            <p className="text-xs text-gray-500">
                                💍 {palette.suggestions.jewelry}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => handleExport(palette)}
                                className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                            >
                                📥 Export
                            </button>
                            <button
                                onClick={() => handleDelete(palette.id)}
                                className="cursor-pointer text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                            >
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyPalettes;
