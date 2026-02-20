import { type FC, useState } from 'react';
import Navbar from './Navbar';
import { SelectedPage } from '../shared/types';

function pathToPage(pathname: string): SelectedPage {
    if (pathname === '/mypalettes') return SelectedPage.MyPalettes;
    if (pathname === '/howitworks') return SelectedPage.HowItWorks;
    return SelectedPage.Home;
}

const Header: FC = () => {
    const [selectedPage, setSelectedPage] = useState<SelectedPage>(
        pathToPage(location.pathname)
    );
    return (
        <Navbar
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
        />
    );
};

export default Header;
