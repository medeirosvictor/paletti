import { type FC, useState } from 'react';
import Navbar from './Navbar';
import { SelectedPage } from '../shared/types';

const Header: FC = () => {
    const [selectedPage, setSelectedPage] = useState<SelectedPage>(
        SelectedPage.Home
    );
    return (
        <>
            <Navbar
                selectedPage={selectedPage}
                setSelectedPage={setSelectedPage}
            />
        </>
    );
};

export default Header;
