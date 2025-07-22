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
                    <svg
                        width="62"
                        height="34"
                        viewBox="0 0 62 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-16 h-9"
                    >
                        <g clipPath="url(#clip0_139_19)">
                            <path d="M14.2144 27.986C9.06208 26.7468 5.53626 22.2552 5.53626 17C5.53626 14.9009 6.10706 12.8929 7.25371 11.077C7.72853 10.2172 7.63761 9.1651 6.96578 8.40133L6.01108 7.44537C5.53626 6.96992 4.86443 6.77771 4.19765 6.77771C3.53088 6.87381 2.96008 7.16212 2.67215 7.73368C0.858726 10.5055 0 13.6566 0 16.9039C0 24.8298 5.62718 31.8048 13.3557 33.4284H13.8305C14.3054 33.4284 14.7852 33.2362 15.1641 32.953C15.6389 32.5685 15.9268 31.9009 15.9268 31.2332V29.994C15.7349 29.1342 15.0681 28.2743 14.2094 27.986" fill="#002337"/>
                            <path d="M25.9435 2.67569C23.1804 0.859863 20.0284 0 16.7855 0C13.5425 0 10.2996 0.955965 7.6274 2.67569C7.0566 3.0601 6.6727 3.63166 6.6727 4.29932C6.57672 4.96697 6.86465 5.63463 7.33947 6.11514L8.29417 7.07111C8.769 7.54656 9.34485 7.73877 9.91565 7.73877C10.2995 7.73877 10.6784 7.64267 11.0623 7.45046C12.8757 6.39839 14.8761 5.82684 16.9774 5.82684C19.0788 5.82684 21.0791 6.39839 22.8925 7.45046C23.7512 8.02202 24.8979 7.83487 25.6606 7.16215L26.6153 6.20619C27.0902 5.73074 27.3781 5.05802 27.2821 4.39036C26.8982 3.6266 26.5194 3.05504 25.9486 2.67063" fill="#009FE3"/>
                            <path d="M45.0223 0.0960693C35.6723 0.0960693 28.1407 7.64263 28.1407 17V17.1922C28.0447 22.5385 24.231 27.1261 19.0786 28.1782C18.4119 28.2743 17.8411 28.9419 17.8411 29.7057V32.2853C17.8411 32.7607 18.033 33.1452 18.4119 33.4335C18.7958 33.7218 19.1746 33.8179 19.6494 33.8179C27.8528 32.4826 33.7679 25.4115 33.7679 17.1011C33.7679 10.8949 38.8243 5.73576 45.1182 5.73576C51.4122 5.73576 56.4686 10.7988 56.4686 17.1011C56.4686 23.4034 51.4122 28.4665 45.1182 28.4665C43.5927 28.4665 42.3501 29.7057 42.3501 31.2383C42.3501 32.7709 43.5877 34.0101 45.1182 34.0101C54.4682 34.0101 61.9998 26.4635 61.9998 17.1062C61.9038 7.64263 54.2712 0.0960693 45.0223 0.0960693Z" fill="#009FE3"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_139_19">
                                <rect width="62" height="34" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
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
