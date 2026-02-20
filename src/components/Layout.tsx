import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-20">
            <Header />
            <main className="w-full max-w-4xl flex-grow mx-auto px-4 py-6">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
