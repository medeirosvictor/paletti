import { useState } from 'react';
import ImageUploadForm from '../components/ImageUploadForm';
import PaletteFinderResults from '../components/PaletteFinderResults';

type Props = {};

function Home({}: Props) {
    const [imageUploaded, setImageUploaded] = useState<string>('');
    const [faceOutlined, setFaceOutlined] = useState<string>('');
    const [hexCluster, setHexCluster] = useState<Array<string> | null>(null);

    return (
        <div className="flex flex-col items-center">
            <ImageUploadForm
                imageUploaded={imageUploaded}
                setImageUploaded={setImageUploaded}
                setFaceOutlined={setFaceOutlined}
                setHexCluster={setHexCluster}
            />

            <PaletteFinderResults
                imageUploaded={imageUploaded}
                faceOutlined={faceOutlined}
                hexCluster={hexCluster}
            />
        </div>
    );
}

export default Home;
