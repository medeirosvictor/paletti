import ImageUploadForm from './components/ImageUploadForm';
import Header from './components/Header';

function App() {
    return (
        <div className="h-full">
            <Header />
            <div className="flex flex-col items-center h-full">
                <ImageUploadForm />
            </div>
        </div>
    );
}

export default App;
