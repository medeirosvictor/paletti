import Logo from '@/assets/logo.png';
import { SelectedPage } from '../shared/types';
import { Link } from 'react-router';

type NavbarProps = {
    selectedPage: SelectedPage;
    setSelectedPage: (value: SelectedPage) => void;
};

function Navbar({ selectedPage, setSelectedPage }: NavbarProps) {
    const linkBase =
        'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50';
    const linkActive = 'bg-white/90 text-gray-700 shadow-sm';
    const linkInactive = 'hover:bg-white/30 text-white';

    const links = [
        { to: '/', page: SelectedPage.Home, label: 'find your colors' },
        { to: '/mypalettes', page: SelectedPage.MyPalettes, label: 'my palettes' },
        { to: '/howitworks', page: SelectedPage.HowItWorks, label: 'how it works' },
    ];

    return (
        <nav className="flex gap-2 px-4 py-3 justify-center items-center bg-gradient-to-r from-lime-300 via-rose-400 to-violet-600 text-white shadow-md">
            {/* logo */}
            <div className="flex flex-1 gap-2 justify-center items-center">
                <img src={Logo} alt="paletti-logo" className="h-10" />
                <h1 className="text-2xl font-bold hidden md:block">Paletti</h1>
            </div>

            {/* nav links */}
            <div className="flex justify-center items-center flex-1 gap-2">
                {links.map(({ to, page, label }) => (
                    <Link
                        key={page}
                        to={to}
                        onClick={() => setSelectedPage(page)}
                        className={`${linkBase} ${selectedPage === page ? linkActive : linkInactive}`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* spacer */}
            <div className="flex-1" />
        </nav>
    );
}

export default Navbar;
