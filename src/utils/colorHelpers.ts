import colorNamer from 'color-namer';

/**
 * Determine if a hex color is "light" (for choosing contrasting text).
 * Uses the YIQ luminance formula.
 */
export function isLightColor(hex: string): boolean {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

/**
 * Get a human-readable color name for a hex value.
 * Uses the NTC (Name That Color) palette for the best results.
 */
export function getColorName(hex: string): string {
    try {
        const result = colorNamer(hex);
        return result.ntc[0].name;
    } catch {
        return hex;
    }
}
