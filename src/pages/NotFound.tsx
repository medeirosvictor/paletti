import { Link } from 'react-router';

function NotFound() {
    return (
        <div className="w-full min-h-[60vh] flex justify-center items-center">
            <div className="flex flex-col gap-4 items-center text-center bg-white/70 backdrop-blur-md rounded-3xl p-12 shadow-lg max-w-lg">
                <p className="text-7xl font-bold text-gray-600">404</p>
                <p className="text-xl text-gray-500">Page not found</p>
                <div className="flex gap-3 mt-2">
                    <Link
                        to="/"
                        className="bg-violet-600 text-white px-5 py-2 rounded-full shadow hover:bg-violet-700 transition-colors font-medium"
                    >
                        find your colors
                    </Link>
                    <Link
                        to="/howitworks"
                        className="bg-white/80 text-gray-600 px-5 py-2 rounded-full shadow border border-gray-200 hover:bg-white transition-colors font-medium"
                    >
                        how it works
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
