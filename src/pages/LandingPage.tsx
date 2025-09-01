import {useNavigate} from "react-router-dom";
import {SearchInput} from "../components/SearchInput";
import {AlphaDisclaimer} from "../components/AlphaDisclaimer";
import {Footer} from "../components/Footer";
import dataCommonsIconBlue from '@/assets/data-commons-icon-blue.svg';
import eoscLogo from '@/assets/logo-eosc-data-commons.svg';

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleSearch = (query: string) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleAbout = () => {
        window.open('https://www.eosc-data-commons.eu/', '_blank', 'noopener,noreferrer');
    };

    const dataCards = [
        "Glucose level changes in the liver of individuals with type 1 diabetes from 1980 to 2020",
        "Data about CO2 levels in europe between 1960 and 2020",
        "Evolution of Japanese population since the 80s"
    ];

    const toolCards = [
        {text: "Analyze biomedical data with Galaxy", url: "https://galaxyproject.org/"},
        {text: "JupyterLab", url: "https://jupyter.org/"},
        {text: "RStudio", url: "https://posit.co/products/open-source/rstudio/"}
    ];

    const features = [
        "10M+ Datasets",
        "100+ Tools and Services",
        "AI-Powered Search",
        "Real-time Updates"
    ];


    return (
        <div className="min-h-screen bg-eosc-bg flex flex-col justify-center items-center px-4 relative">
            <AlphaDisclaimer/>
            {/* EOSC Icon - Fixed in top left */}
            <img
                src={dataCommonsIconBlue}
                alt="EOSC"
                className="absolute top-6 left-6 w-16 h-9 z-10"
            />

            {/* About Button - Fixed in top right */}
            <button
                onClick={handleAbout}
                className="absolute top-6 right-6 bg-white border border-eosc-border rounded-lg px-4 py-2 text-sm font-light text-eosc-text hover:bg-gray-50 hover:border-eosc-light-blue transition-colors cursor-pointer z-10"
            >
                About
            </button>

            <div className="w-full max-w-7xl mx-auto">
                {/* Header with Logo */}
                <div className="pt-6 pb-8">
                    {/* Main Logo */}
                    <div className="flex justify-center mt-16 mb-8">
                        <img
                            src={eoscLogo}
                            alt="EOSC Data Commons"
                            className="w-full max-w-lg h-auto"
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="text-center mb-8">
                        <p className="text-2xl font-light text-eosc-gray max-w-2xl mx-auto px-4">
                            Search through millions of high quality scientific datasets using natural language
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="flex justify-center px-4">
                        <SearchInput
                            onSearch={handleSearch}
                            className="w-full max-w-2xl"
                        />
                    </div>
                </div>

                {/* What can you discover section */}
                <div className="py-12">
                    <h2 className="text-3xl font-light text-eosc-text text-center mb-12">
                        What can you discover?
                    </h2>

                    <div className="max-w-7xl mx-auto px-4">
                        {/* Data Section */}
                        <div className="mb-12">
                            <h3 className="text-3xl font-light text-eosc-text text-left mb-8 ml-4">
                                Data
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dataCards.map((card, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSearch(card)}
                                        className="bg-white border border-eosc-border rounded-xl p-6 min-h-[75px] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-eosc-light-blue transition-colors"
                                    >
                                        <p className="text-sm font-light text-black text-center">
                                            {card}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tools Section */}
                        <div className="mb-12">
                            <h3 className="text-3xl font-light text-eosc-text text-left mb-8 ml-4">
                                Tools
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {toolCards.map((card, index) => (
                                    <div
                                        key={index}
                                        onClick={() => window.open(card.url, '_blank')}
                                        className="bg-white border border-eosc-border rounded-xl p-6 min-h-[75px] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-eosc-light-blue transition-colors"
                                    >
                                        <p className="text-sm font-light text-black text-center">
                                            {card.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Features Section  */}
                        <div className="py-8">
                            <div className="flex flex-wrap justify-center items-center gap-8 px-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-eosc-dark-blue rounded-full"></div>
                                        <span className="text-base font-light text-eosc-gray">
                                    • {feature}
                                </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};
