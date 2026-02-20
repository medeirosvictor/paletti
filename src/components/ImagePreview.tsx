interface ImagePreviewProps {
    src: string;
    title: string;
}

function ImagePreview({ src, title }: ImagePreviewProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-white drop-shadow-md">
                {title}
            </p>
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white/70 backdrop-blur-md p-1">
                <img
                    className="w-72 h-72 object-contain rounded-xl"
                    src={src}
                    alt={title}
                />
            </div>
        </div>
    );
}

export default ImagePreview;
