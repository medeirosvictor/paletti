interface ImagePreviewProps {
    src: string;
    title: string;
}

function ImagePreview({ src, title }: ImagePreviewProps) {
    return (
        <div className="flex flex-col justify-center items-center mt-5">
            <p className="text-xl underline uppercase">{title}:</p>
            <img className="w-[400px] rounded-xl" src={src} alt="preview" />
        </div>
    );
}

export default ImagePreview;
