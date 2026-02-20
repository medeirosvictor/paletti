import type { ColorSuggestions } from '../hooks/useColorSuggestions';

const SEASON_LABELS: Record<string, string> = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    fall: '🍂 Fall',
    winter: '❄️ Winter',
};

function isLightColor(hex: string): boolean {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

/**
 * Generate a PNG image of the palette and trigger a download.
 */
export function exportPaletteAsPng(
    skinTones: string[],
    suggestions: ColorSuggestions
): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const swatchSize = 80;
    const gap = 8;
    const padding = 32;
    const seasonGap = 24;
    const colsPerRow = 3;
    const seasons = Object.entries(suggestions.seasons).filter(([, c]) => c.length > 0);

    const contentWidth = colsPerRow * swatchSize + (colsPerRow - 1) * gap;
    const canvasWidth = contentWidth + padding * 2;

    // Calculate height
    let y = padding;
    y += 40; // title
    y += 16; // gap
    // skin tones row
    y += 24; // label
    y += swatchSize + 12;
    // seasons
    for (const [, colors] of seasons) {
        y += 28; // season label
        const rows = Math.ceil(colors.length / colsPerRow);
        y += rows * swatchSize + (rows - 1) * gap + seasonGap;
    }
    // jewelry
    if (suggestions.jewelry) y += 32;
    y += padding;

    const canvasHeight = y;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Background
    ctx.fillStyle = '#fafafa';
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, 16);
    ctx.fill();

    let currentY = padding;

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('My Paletti Colors', canvasWidth / 2, currentY + 28);
    currentY += 52;

    // Skin tones
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Detected Skin Tones', canvasWidth / 2, currentY + 14);
    currentY += 24;

    const skinStartX = (canvasWidth - (skinTones.length * (swatchSize * 0.7 + gap) - gap)) / 2;
    skinTones.forEach((hex, i) => {
        const x = skinStartX + i * (swatchSize * 0.7 + gap);
        const s = swatchSize * 0.7;
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.roundRect(x, currentY, s, s, 10);
        ctx.fill();
        ctx.fillStyle = isLightColor(hex) ? '#000' : '#fff';
        ctx.font = 'bold 10px "DM Sans", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hex, x + s / 2, currentY + s / 2 + 4);
    });
    currentY += swatchSize * 0.7 + 16;

    // Seasons
    for (const [season, colors] of seasons) {
        ctx.fillStyle = '#444';
        ctx.font = 'bold 16px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(SEASON_LABELS[season] ?? season, canvasWidth / 2, currentY + 18);
        currentY += 28;

        const rows = Math.ceil(colors.length / colsPerRow);
        for (let row = 0; row < rows; row++) {
            const rowColors = colors.slice(row * colsPerRow, (row + 1) * colsPerRow);
            const rowStartX = (canvasWidth - (rowColors.length * (swatchSize + gap) - gap)) / 2;
            rowColors.forEach((hex, i) => {
                const x = rowStartX + i * (swatchSize + gap);
                const ry = currentY + row * (swatchSize + gap);
                ctx.fillStyle = hex;
                ctx.beginPath();
                ctx.roundRect(x, ry, swatchSize, swatchSize, 12);
                ctx.fill();
                ctx.fillStyle = isLightColor(hex) ? '#000' : '#fff';
                ctx.font = 'bold 11px "DM Sans", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(hex, x + swatchSize / 2, ry + swatchSize / 2 + 4);
            });
        }
        currentY += rows * swatchSize + (rows - 1) * gap + seasonGap;
    }

    // Jewelry
    if (suggestions.jewelry) {
        ctx.fillStyle = '#555';
        ctx.font = '15px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`💍 Recommended: ${suggestions.jewelry}`, canvasWidth / 2, currentY + 18);
    }

    // Download
    const link = document.createElement('a');
    link.download = 'my-paletti-colors.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
