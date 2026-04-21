import { useEffect, useRef } from 'react';

export default function PageTransition({ children }) {
    const wrapperRef = useRef(null);

    useEffect(() => {
        const element = wrapperRef.current;
        if (element) {
            element.classList.add('page-enter');
            const timer = setTimeout(() => {
                element.classList.remove('page-enter');
            }, 350);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div ref={wrapperRef} className="page-transition-wrapper">
            {children}
        </div>
    );
}
