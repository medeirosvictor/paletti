import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import Prism from './Prism';
import InstallPWA from './InstallPWA';

export default function Layout() {
    return (
        <div className="relative flex flex-col min-h-screen">
            {/* Prism background — fixed behind everything */}
            <div className="fixed inset-0 -z-10">
                <Prism
                    animationType="rotate"
                    timeScale={0.25}
                    height={3.5}
                    baseWidth={5.5}
                    scale={3.6}
                    hueShift={0}
                    colorFrequency={2.4}
                    noise={0}
                    glow={1}
                    transparent={false}
                    backgroundColor="#060010"
                />
            </div>

            <Header />
            <main className="w-full max-w-4xl flex-grow mx-auto px-4 py-6">
                <Outlet />
            </main>
            <Footer />
            <InstallPWA />
        </div>
    );
}
