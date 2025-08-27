interface ImagePreviewProps {
    src: string;
    title: string;
}

function ImagePreview({ src, title }: ImagePreviewProps) {
    return (
        <div className="flex flex-col justify-center items-center mt-5">
            <p className="text-xl underline uppercase">{title}:</p>
            <div className="rounded-xl border-1">
                <img
                    className="w-72 h-72 object-contain rounded-xl"
                    src={src}
                    alt="preview"
                />
            </div>
        </div>
    );
}

export default ImagePreview;
