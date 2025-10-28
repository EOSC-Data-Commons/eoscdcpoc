import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {LandingPage} from "./pages/LandingPage";
import {SearchPage} from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import {ErrorBoundary} from "./components/ErrorBoundary";

declare global {
    interface Window {
        _mtm: Record<string, unknown>[];
    }
}

export default function App() {
    React.useEffect(() => {
        const matomoUrl = import.meta.env.VITE_MATOMO_CONTAINER_URL;

        if (!matomoUrl) {
            console.warn('VITE_MATOMO_CONTAINER_URL is not defined in environment variables');
            return;
        }

        window._mtm = window._mtm || [];
        window._mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
        const d = document;
        const g = d.createElement('script');
        const s = d.getElementsByTagName('script')[0];
        g.async = true;
        g.src = matomoUrl;
        s.parentNode!.insertBefore(g, s);
    }, []);

    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/search" element={<SearchPage/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
}