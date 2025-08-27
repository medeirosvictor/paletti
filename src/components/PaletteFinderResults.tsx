import React from 'react';
import HexCluster from './HexCluster';
import ImagePreview from './ImagePreview';

type Props = {
    imageUploaded: string;
    faceOutlined: string;
    hexCluster: Array<string> | null;
};

function PaletteFinderResults({
    imageUploaded,
    faceOutlined,
    hexCluster,
}: Props) {
    return (
        <div className="flex flex-col">
            <div>{hexCluster && <HexCluster cluster={hexCluster} />}</div>
            <div className="flex gap-1 justify-center items-center">
                <div>
                    {imageUploaded && (
                        <ImagePreview
                            src={imageUploaded}
                            title="Image Uploaded"
                        />
                    )}
                </div>
                <div>
                    {faceOutlined && (
                        <ImagePreview src={faceOutlined} title="Face Outline" />
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaletteFinderResults;
