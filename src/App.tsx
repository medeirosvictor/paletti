import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import MyPalettes from './pages/MyPalettes';
import NotFound from './pages/NotFound';
import HowItWorks from './pages/HowItWorks';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/mypalettes" element={<MyPalettes />} />
                    <Route path="/howitworks" element={<HowItWorks />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
