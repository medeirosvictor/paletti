import { useState } from 'react';
import HexCluster from './HexCluster';
import ImagePreview from './ImagePreview';
import ProcessingIndicator from './ProcessingIndicator';
import SavePaletteModal from './SavePaletteModal';
import Markdown from 'react-markdown';
import { usePalette } from '../context/PaletteContext';
import { savePalette } from '../utils/paletteHistory';
import { exportPaletteAsPng } from '../utils/exportPalette';
import { isLightColor, getColorName } from '../utils/colorHelpers';

const SEASON_LABELS: Record<string, string> = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    fall: '🍂 Fall',
    winter: '❄️ Winter',
};

function PaletteFinderResults() {
    const {
        imageUploaded,
        faceOutlined,
        hexCluster,
        processingStep,
        suggestions,
        suggestionsLoading,
        suggestionsError,
        fetchSuggestions,
    } = usePalette();

    const [saved, setSaved] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [copiedHex, setCopiedHex] = useState<string | null>(null);

    const handleClick = () => {
        if (hexCluster && !suggestionsLoading) {
            setSaved(false);
            fetchSuggestions(hexCluster);
        }
    };

    const handleSaveClick = () => {
        setSaveModalOpen(true);
    };

    const handleSaveConfirm = (name: string) => {
        if (hexCluster && suggestions) {
            savePalette(name, hexCluster, suggestions);
            setSaved(true);
        }
        setSaveModalOpen(false);
    };

    const handleExport = () => {
        if (hexCluster && suggestions) {
            exportPaletteAsPng(hexCluster, suggestions);
        }
    };

    const handleSwatchCopy = async (hex: string) => {
        try {
            await navigator.clipboard.writeText(hex);
        } catch {
            // silent fallback
        }
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 1200);
    };

    const hasSeasonColors = suggestions?.seasons &&
        Object.values(suggestions.seasons).some((arr) => arr.length > 0);

    return (
        <div className="flex flex-col items-center gap-5">
            {/* Detected skin tones */}
            {hexCluster && (
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg w-full">
                    <HexCluster cluster={hexCluster} title="detected skin tones" />
                </div>
            )}

            {/* Error display */}
            {suggestionsError && !suggestions && (
                <div className="bg-red-50/90 backdrop-blur-md text-red-600 p-4 rounded-xl text-center max-w-md border border-red-200">
                    <p className="font-semibold">Something went wrong</p>
                    <p className="text-sm mt-1">{suggestionsError}</p>
                    {hexCluster && (
                        <button
                            type="button"
                            onClick={handleClick}
                            disabled={suggestionsLoading}
                            className="cursor-pointer mt-3 bg-indigo-600 text-white px-5 py-2 rounded-full shadow-sm hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            🔄 Try again
                        </button>
                    )}
                </div>
            )}

            {/* Generating indicator */}
            {suggestionsLoading && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl px-6 py-3 shadow-sm">
                    <ProcessingIndicator step="generating" />
                </div>
            )}

            {/* Find palette button */}
            {faceOutlined && !suggestions && !suggestionsLoading && (
                <button
                    className="cursor-pointer bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleClick}
                    disabled={suggestionsLoading}
                >
                    {suggestionsError ? '🔄 retry' : '✨ find my palette!'}
                </button>
            )}

            {/* Season-grouped color suggestions */}
            {hasSeasonColors && suggestions && (
                <div className="flex flex-col items-center gap-5 w-full max-w-[700px]">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">Your Colors!</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {Object.entries(suggestions.seasons).map(([season, colors]) =>
                            colors.length > 0 && (
                                <div
                                    key={season}
                                    className="flex flex-col items-center gap-2 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm"
                                >
                                    <h3 className="text-base font-semibold text-gray-600">
                                        {SEASON_LABELS[season] ?? season}
                                    </h3>
                                    <div className="flex gap-2">
                                        {colors.map((hex, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSwatchCopy(hex)}
                                                className="w-[64px] h-[76px] rounded-xl flex flex-col items-center justify-center font-bold text-[10px] cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                                                style={{
                                                    backgroundColor: hex,
                                                    color: isLightColor(hex) ? '#000' : '#fff',
                                                }}
                                                aria-label={`Copy color ${hex} (${getColorName(hex)})`}
                                                title={`${getColorName(hex)} — click to copy ${hex}`}
                                            >
                                                {copiedHex === hex ? (
                                                    <span className="animate-toast">copied!</span>
                                                ) : (
                                                    <>
                                                        <span className="text-[8px] leading-tight opacity-80">{getColorName(hex)}</span>
                                                        <span>{hex}</span>
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Jewelry recommendation */}
                    {suggestions.jewelry && (
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl px-6 py-3 shadow-sm">
                            <p className="text-base text-gray-600">
                                💍 Recommended jewelry:{' '}
                                <span className="font-bold capitalize">{suggestions.jewelry}</span>
                            </p>
                        </div>
                    )}

                    {/* Save modal */}
                    <SavePaletteModal
                        open={saveModalOpen}
                        onSave={handleSaveConfirm}
                        onCancel={() => setSaveModalOpen(false)}
                    />

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            className={`cursor-pointer px-5 py-2 rounded-full shadow-sm font-medium transition-colors backdrop-blur-sm ${
                                saved
                                    ? 'bg-green-100/90 text-green-700 border border-green-300'
                                    : 'bg-white/70 text-gray-600 border border-white/50 hover:bg-white/90'
                            }`}
                        >
                            {saved ? '✅ Saved!' : '💾 Save Palette'}
                        </button>
                        <button
                            type="button"
                            onClick={handleExport}
                            className="cursor-pointer bg-white/70 text-gray-600 px-5 py-2 rounded-full shadow-sm border border-white/50 hover:bg-white/90 transition-colors font-medium backdrop-blur-sm"
                        >
                            📥 Export as PNG
                        </button>
                        <button
                            type="button"
                            onClick={handleClick}
                            disabled={suggestionsLoading}
                            className="cursor-pointer bg-white/70 text-gray-600 px-5 py-2 rounded-full shadow-sm border border-white/50 hover:bg-white/90 transition-colors font-medium backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🔄 Regenerate
                        </button>
                    </div>

                    {/* Explanation */}
                    {suggestions.explanation && (
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-sm w-full">
                            <div className="prose prose-sm max-w-none text-gray-600 text-justify leading-relaxed">
                                <Markdown>{suggestions.explanation}</Markdown>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {faceOutlined && processingStep === 'done' && !suggestions && (
                <p className="text-white font-medium drop-shadow-md">Face detected! ✅</p>
            )}

            {/* Image previews */}
            <div className="flex flex-col-reverse md:flex-row gap-4 justify-center items-center">
                {imageUploaded && (
                    <ImagePreview src={imageUploaded} title="Image Uploaded" />
                )}
                {faceOutlined && (
                    <ImagePreview src={faceOutlined} title="Face Outline" />
                )}
            </div>
        </div>
    );
}

export default PaletteFinderResults;
