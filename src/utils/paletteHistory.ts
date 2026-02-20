import type { ColorSuggestions } from '../hooks/useColorSuggestions';

export interface SavedPalette {
    id: string;
    name: string;
    timestamp: number;
    skinTones: string[];
    suggestions: ColorSuggestions;
}

const STORAGE_KEY = 'paletti_history';

export function getSavedPalettes(): SavedPalette[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function savePalette(name: string, skinTones: string[], suggestions: ColorSuggestions): SavedPalette {
    const palette: SavedPalette = {
        id: crypto.randomUUID(),
        name: name.trim() || 'Untitled Palette',
        timestamp: Date.now(),
        skinTones,
        suggestions,
    };
    const existing = getSavedPalettes();
    existing.unshift(palette);
    // Keep max 20 palettes
    const trimmed = existing.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return palette;
}

export function deletePalette(id: string): void {
    const existing = getSavedPalettes();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllPalettes(): void {
    localStorage.removeItem(STORAGE_KEY);
}
