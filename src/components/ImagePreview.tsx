interface ImagePreviewProps {
    src: string;
    title: string;
}

function ImagePreview({ src, title }: ImagePreviewProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {title}
            </p>
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white">
                <img
                    className="w-72 h-72 object-contain"
                    src={src}
                    alt={title}
                />
            </div>
        </div>
    );
}

export default ImagePreview;
