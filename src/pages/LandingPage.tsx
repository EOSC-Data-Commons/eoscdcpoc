import {useNavigate} from "react-router-dom";
import {SearchInput} from "../components/SearchInput";

export const LandingPage = () => {
    const navigate = useNavigate();

    const handleSearch = (query: string) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const dataCards = [
        "Glucose level changes in the liver of individuals with type 1 diabetes from 1980 to 2020",
        "Data about CO2 levels in europe between 1960 and 2020",
        "Evolution of Japanese population since the 80s"
    ];

    const toolCards = [
        "Analyze biomedical data with Galaxy",
        "JupyterLab",
        "RStudio"
    ];

    const features = [
        "10M+ Datasets",
        "100+ Tools and Services",
        "AI-Powered Search",
        "Real-time Updates"
    ];



    return (
        <div className="min-h-screen bg-eosc-bg">
            {/* Header with Logo */}
            <div className="pt-6 pb-8">
                <div className="flex justify-start pl-6">
                    {/* EOSC Icon */}
                    <img
                        src="/data-commons-icon-blue.svg"
                        alt="EOSC"
                        className="w-16 h-9"
                    />
                </div>

                {/* Main Logo */}
                <div className="flex justify-center mt-16 mb-8">
                    <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/e0a0954257e9a8d26ba6ddf26c707b3d0b164151?width=1098"
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
                                    className="bg-white border border-eosc-border rounded-xl p-6 min-h-[75px] flex items-center justify-center"
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
                                    className="bg-white border border-eosc-border rounded-xl p-6 min-h-[75px] flex items-center justify-center"
                                >
                                    <p className="text-sm font-light text-black text-center">
                                        {card}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Footer */}
            <div className="py-8 border-t border-eosc-border">
                <div className="flex flex-wrap justify-center items-center gap-8 px-4">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-eosc-dark-blue rounded-full"></div>
                            <span className="text-base font-light text-eosc-gray">
                {feature}
              </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
