interface ImagePreviewProps {
    src: string;
    title: string;
}

function ImagePreview({ src, title }: ImagePreviewProps) {
    return (
        <div className="flex flex-col justify-center items-center bg-white">
            <p className="text-xl uppercase font-bold">{title}:</p>
            <div className="border-1 shadow-md">
                <img
                    className="w-72 h-72 object-contain "
                    src={src}
                    alt="preview"
                />
            </div>
        </div>
    );
}

export default ImagePreview;
