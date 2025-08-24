interface ImagePreviewProps {
    src?: string;
}

function ImagePreview({ src }: ImagePreviewProps) {
    return (
        <div>
            <p>Preview: </p>
            <img className="max-w-[400px]" src={src} alt="preview" />
        </div>
    );
}

export default ImagePreview;
