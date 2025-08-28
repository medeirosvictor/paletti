import { type ReactNode, useState } from 'react';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(true);

    if (isAuthorized === null) {
        setIsAuthorized(true);
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
