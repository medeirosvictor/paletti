import ImageUploadForm from './components/ImageUploadForm';
import Header from './components/Header';
import PaletteFinderResults from './components/PaletteFinderResults';
import { useState } from 'react';

function App() {
    const [imageUploaded, setImageUploaded] = useState<string>('');
    const [faceOutlined, setFaceOutlined] = useState<string>('');
    const [hexCluster, setHexCluster] = useState<Array<string> | null>(null);

    return (
        <div className="h-full">
            <Header />
            <div className="flex flex-col items-center h-full w-5/6 mx-auto">
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
        </div>
    );
}

export default App;
