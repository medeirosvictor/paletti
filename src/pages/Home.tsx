import { PaletteProvider } from '../context/PaletteContext';
import ImageUploadForm from '../components/ImageUploadForm';
import PaletteFinderResults from '../components/PaletteFinderResults';

function Home() {
    return (
        <PaletteProvider>
            <div className="flex flex-col items-center gap-4">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg w-full">
                    <ImageUploadForm />
                </div>
                <PaletteFinderResults />
            </div>
        </PaletteProvider>
    );
}

export default Home;
