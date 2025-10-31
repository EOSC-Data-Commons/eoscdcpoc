import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {LandingPage} from "./pages/LandingPage";
import {SearchPage} from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import {ErrorBoundary} from "./components/ErrorBoundary";
import MatomoTracker from "./components/MatomoTracker";

export default function App() {

    return (
        <BrowserRouter>
            <MatomoTracker />
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