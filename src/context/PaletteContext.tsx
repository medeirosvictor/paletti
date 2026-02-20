import {
    createContext,
    useContext,
    useCallback,
    useState,
    type ReactNode,
} from 'react';
import { useColorSuggestions, type ColorSuggestions } from '../hooks/useColorSuggestions';

export type ProcessingStep =
    | 'idle'
    | 'compressing'
    | 'detecting'
    | 'extracting'
    | 'generating'
    | 'done'
    | 'error';

interface PaletteState {
    // Image state
    imageUploaded: string;
    faceOutlined: string;
    hexCluster: string[] | null;
    faceDetected: boolean | null;

    // Processing state
    processingStep: ProcessingStep;
    error: string | null;

    // LLM suggestions
    suggestions: ColorSuggestions | null;
    suggestionsLoading: boolean;
    suggestionsError: string | null;
}

interface PaletteActions {
    setImageUploaded: (url: string) => void;
    setFaceOutlined: (url: string) => void;
    setHexCluster: (cluster: string[] | null) => void;
    setFaceDetected: (detected: boolean | null) => void;
    setProcessingStep: (step: ProcessingStep) => void;
    setError: (error: string | null) => void;
    fetchSuggestions: (hexCluster: string[]) => Promise<void>;
    resetAll: () => void;
    resetForNewImage: () => void;
}

type PaletteContextType = PaletteState & PaletteActions;

const PaletteContext = createContext<PaletteContextType | null>(null);

export function PaletteProvider({ children }: { children: ReactNode }) {
    const [imageUploaded, setImageUploaded] = useState('');
    const [faceOutlined, setFaceOutlined] = useState('');
    const [hexCluster, setHexCluster] = useState<string[] | null>(null);
    const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
    const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
    const [error, setError] = useState<string | null>(null);

    const {
        suggestions,
        loading: suggestionsLoading,
        error: suggestionsError,
        fetchSuggestions,
        reset: resetSuggestions,
    } = useColorSuggestions();

    const resetForNewImage = useCallback(() => {
        if (faceOutlined) URL.revokeObjectURL(faceOutlined);
        setFaceOutlined('');
        setHexCluster(null);
        setFaceDetected(null);
        setProcessingStep('idle');
        setError(null);
        resetSuggestions();
    }, [faceOutlined, resetSuggestions]);

    const resetAll = useCallback(() => {
        if (imageUploaded) URL.revokeObjectURL(imageUploaded);
        setImageUploaded('');
        resetForNewImage();
    }, [imageUploaded, resetForNewImage]);

    return (
        <PaletteContext.Provider
            value={{
                imageUploaded,
                faceOutlined,
                hexCluster,
                faceDetected,
                processingStep,
                error,
                suggestions,
                suggestionsLoading,
                suggestionsError,
                setImageUploaded,
                setFaceOutlined,
                setHexCluster,
                setFaceDetected,
                setProcessingStep,
                setError,
                fetchSuggestions,
                resetAll,
                resetForNewImage,
            }}
        >
            {children}
        </PaletteContext.Provider>
    );
}

export function usePalette(): PaletteContextType {
    const ctx = useContext(PaletteContext);
    if (!ctx) throw new Error('usePalette must be used within PaletteProvider');
    return ctx;
}
