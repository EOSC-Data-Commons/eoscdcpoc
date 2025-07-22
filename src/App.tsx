

import {BrowserRouter, Routes, Route} from "react-router-dom";
import {LandingPage} from "./pages/LandingPage";
import {SearchPage} from "./pages/SearchPage";
import NotFound from "./pages/NotFound";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/search" element={<SearchPage/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}
