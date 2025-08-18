import {useEffect, useLayoutEffect, useState} from 'react';
import {X} from 'lucide-react';


export const AlphaDisclaimer = () => {
    const [visible, setVisible] = useState(false); // controls animation state
    const [mounted, setMounted] = useState(true);  // controls actual render removal after exit
    const [animReady, setAnimReady] = useState(false); // ensures initial off-screen state applied before animating in


    useLayoutEffect(() => {
        setAnimReady(true);
    }, []);

    useEffect(() => {
        if (animReady) {
            requestAnimationFrame(() => setVisible(true));
        }
    }, [animReady]);

    const handleClose = () => {
        setVisible(false);
    };

    const handleTransitionEnd = () => {
        if (!visible) {
            // After exit animation, unmount component completely
            setMounted(false);
        }
    };

    if (!mounted) return null;

    const stateClasses = visible
        ? 'translate-x-0 opacity-100 pointer-events-auto'
        : 'translate-x-[120%] opacity-0 pointer-events-none';

    return (
        <div
            className={`fixed top-4 right-4 z-50 w-80 max-w-[90vw] transform transition-all duration-500 ease-out will-change-transform ${stateClasses}`}
            role="note"
            aria-label="Alpha stage disclaimer"
            onTransitionEnd={handleTransitionEnd}
        >
            <div
                className="relative overflow-hidden rounded-xl border border-blue-300 bg-white/95 backdrop-blur-md p-4 shadow-xl">
                <button
                    onClick={handleClose}
                    aria-label="Dismiss alpha disclaimer"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <X className="w-4 h-4"/>
                </button>
                <p className="text-xs leading-relaxed text-gray-700">
                    <span className="font-semibold tracking-wide text-blue-700">ALPHA NOTICE:</span> This service is in
                    an early alpha stage. Search results and metadata may be incomplete, outdated, or inaccurate. Please
                    verify critical information independently.
                </p>
            </div>
        </div>
    );
};
