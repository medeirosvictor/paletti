type Props = {};
import { Link } from 'react-router';
function NotFound({}: Props) {
    return (
        <div className="w-full h-full flex justify-center items-center bg-gray-50">
            <div className="flex flex-col gap-5 justify-center items-centershadow-xl bg-gradient-to-r from-yellow-200 via-orange-500 to-red-500 md:w-3/6 md:h-3/6 p-10 text-gray-700">
                <div className="text-8xl">404 not found</div>
                <div className="text-4xl">
                    go{' '}
                    <Link className="cursor-pointer underline" to="/">
                        home and get your colors
                    </Link>{' '}
                    or find out{' '}
                    <Link className="cursor-pointer underline" to="/howitworks">
                        how paletti works
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
