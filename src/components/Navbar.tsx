import Logo from '@/assets/logo.png';
import { SelectedPage } from '../shared/types';
import { Link } from 'react-router';

type NavbarProps = {
    selectedPage: SelectedPage;
    setSelectedPage: (value: SelectedPage) => void;
};

function Navbar({ selectedPage, setSelectedPage }: NavbarProps) {
    return (
        <nav className="flex justify-around gap-2 p-2 justify-center items-center bg-gradient-to-r from-lime-200 via-red-500 to-violet-700 text-white shadow-md">
            {/* logo on the left */}
            <div className="flex flex-1 gap-1 justify-center items-center">
                <img src={Logo} alt="paletti-logo" />
                <div className="flex flex-col hidden md:block">
                    <h1 className="text-3xl">Paletti</h1>
                </div>
            </div>
            {/* center pages */}
            <div className="flex justify-center items-center flex-1 gap-2">
                <Link
                    to="/"
                    onClick={() => setSelectedPage(SelectedPage.Home)}
                    className={`cursor-pointer border-1 p-1 hover:bg-white hover:text-black ${
                        selectedPage === SelectedPage.Home
                            ? 'bg-white text-black'
                            : ''
                    }`}
                >
                    find your colors
                </Link>
                <Link
                    to="/howitworks"
                    onClick={() => setSelectedPage(SelectedPage.HowItWorks)}
                    className={`cursor-pointer border-1 p-1 hover:bg-white hover:text-black ${
                        selectedPage === SelectedPage.HowItWorks
                            ? 'bg-white text-black'
                            : ''
                    }`}
                >
                    how it works
                </Link>
            </div>
            {/* login on the right */}
            <div className="flex justify-center items-center flex-1">
                <button className="cursor-pointer border-1 p-1 hover:bg-white hover:text-black">
                    login
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
