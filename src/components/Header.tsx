import { type FC } from 'react';
import { useLocation } from 'react-router';
import PillNav from './PillNav';
import Logo from '@/assets/logo.png';

const Header: FC = () => {
    const { pathname } = useLocation();

    return (
        <div className="relative w-full" style={{ height: '70px' }}>
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
            />
        </div>
    );
};

export default Header;
