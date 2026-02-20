import { type FC } from 'react';
import { useLocation, Link } from 'react-router';
import PillNav from './PillNav';
import Logo from '@/assets/logo.png';

const Header: FC = () => {
    const { pathname } = useLocation();

    return (
        <div className="relative w-full flex flex-col items-center pt-4 pb-2 gap-3">
            {/* Logo above nav */}
            <Link
                to="/"
                className="relative z-[1001] w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
            >
                <img src={Logo} alt="Paletti Logo" className="w-full h-full object-cover" />
            </Link>

            {/* Pill nav below */}
            <div className="relative w-full" style={{ height: '50px' }}>
                <PillNav
                    logo={Logo}
                    logoAlt="Paletti Logo"
                    items={[
                        { label: 'Find Your Colors', href: '/' },
                        { label: 'My Palettes', href: '/mypalettes' },
                        { label: 'How It Works', href: '/howitworks' },
                    ]}
                    activeHref={pathname}
                    baseColor="#1a1028"
                    pillColor="rgba(255,255,255,0.85)"
                    pillTextColor="#444"
                    hoveredPillTextColor="#fff"
                    ease="power2.easeOut"
                    initialLoadAnimation={true}
                    hideLogo
                />
            </div>
        </div>
    );
};

export default Header;
