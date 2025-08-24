import { useState } from 'react';
import ImageUploadForm from './components/ImageUploadForm';

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <ImageUploadForm />
            </div>
        </>
    );
}

export default App;
