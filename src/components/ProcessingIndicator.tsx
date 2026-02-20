import type { ProcessingStep } from '../context/PaletteContext';

const STEPS: { key: ProcessingStep; label: string }[] = [
    { key: 'compressing', label: 'Compressing image' },
    { key: 'detecting', label: 'Detecting face' },
    { key: 'extracting', label: 'Extracting colors' },
    { key: 'generating', label: 'Generating palette' },
];

interface Props {
    step: ProcessingStep;
}

function ProcessingIndicator({ step }: Props) {
    const currentIndex = STEPS.findIndex((s) => s.key === step);

    return (
        <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                {STEPS.map((s, i) => {
                    const isActive = i === currentIndex;
                    const isDone = i < currentIndex;

                    return (
                        <div key={s.key} className="flex items-center gap-1.5">
                            <div
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    isDone
                                        ? 'bg-green-500'
                                        : isActive
                                          ? 'bg-amber-500 animate-pulse'
                                          : 'bg-gray-200'
                                }`}
                            />
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`w-5 h-0.5 rounded-full ${
                                        isDone ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-sm font-medium text-gray-400 animate-pulse">
                {STEPS[currentIndex]?.label ?? 'Processing'}...
            </p>
        </div>
    );
}

export default ProcessingIndicator;
