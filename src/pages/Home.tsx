import { PaletteProvider } from '../context/PaletteContext';
import ImageUploadForm from '../components/ImageUploadForm';
import PaletteFinderResults from '../components/PaletteFinderResults';

function Home() {
    return (
        <PaletteProvider>
            <div className="flex flex-col items-center gap-4">
                <ImageUploadForm />
                <PaletteFinderResults />
            </div>
        </PaletteProvider>
    );
}

export default Home;
