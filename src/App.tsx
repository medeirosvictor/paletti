import { BrowserRouter, Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import HowItWorks from './pages/HowItWorks';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/howitworks" element={<HowItWorks />} />
                </Route>

                {/* Routes without layout (e.g. login page, or 404) */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
