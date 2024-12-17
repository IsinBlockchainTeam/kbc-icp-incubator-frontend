import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type NavigationBlockerProps = {
    condition: () => boolean;
    children: React.ReactNode;
    redirectPath: string;
};

const NavigationBlocker = ({ condition, children, redirectPath }: NavigationBlockerProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isConditionMet = !condition() && location.pathname !== redirectPath;

    useEffect(() => {
        if (isConditionMet) {
            navigate(redirectPath);
        }
    }, [location]);

    const buildChild = () => {
        if (isConditionMet) {
            return null;
        }

        return children;
    };

    return <>{buildChild()}</>;
};

export default NavigationBlocker;
