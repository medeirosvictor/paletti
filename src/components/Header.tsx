import { type FC } from 'react';
import Logo from '@/assets/logo.png';

const Header: FC = () => {
    return (
        <div className="flex justify-center items-center my-5">
            {/* logo */}
            <img src={Logo} alt="paletti-logo" />
            <div className="flex flex-col">
                <h1 className="text-5xl">Paletti</h1>
                <p className="underline">Find your color palette!</p>
            </div>
        </div>
    );
};

export default Header;
