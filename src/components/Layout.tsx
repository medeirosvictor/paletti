import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="w-5/6 flex-grow mx-auto p-2">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
