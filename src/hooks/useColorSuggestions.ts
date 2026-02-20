import { useState, useCallback } from 'react';

export interface ColorSuggestions {
    seasons: {
        spring: string[];
        summer: string[];
        fall: string[];
        winter: string[];
    };
    explanation: string;
    jewelry: string;
}

interface UseColorSuggestionsReturn {
    suggestions: ColorSuggestions | null;
    loading: boolean;
    error: string | null;
    fetchSuggestions: (hexCluster: string[]) => Promise<void>;
    reset: () => void;
}

export function useColorSuggestions(): UseColorSuggestionsReturn {
    const [suggestions, setSuggestions] = useState<ColorSuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setSuggestions(null);
        setError(null);
    }, []);

    const fetchSuggestions = useCallback(async (hexCluster: string[]) => {
        setLoading(true);
        setError(null);
        setSuggestions(null);

        try {
            const response = await fetch('/api/color-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hexCluster }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || `Request failed (${response.status})`);
            }

            const data = await response.json();

            if (data.parseError) {
                setError('AI response could not be parsed into colors. The raw explanation is shown below.');
                setSuggestions({
                    seasons: { spring: [], summer: [], fall: [], winter: [] },
                    explanation: data.explanation ?? '',
                    jewelry: '',
                });
                return;
            }

            setSuggestions({
                seasons: data.seasons ?? { spring: [], summer: [], fall: [], winter: [] },
                explanation: data.explanation ?? '',
                jewelry: data.jewelry ?? '',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
            console.error('Color suggestions error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { suggestions, loading, error, fetchSuggestions, reset };
}
