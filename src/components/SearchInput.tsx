import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {SHOW_MODEL_SELECTOR} from "../lib/config";
import {ModelSelector} from "./ModelSelector.tsx";


const models = [
    "openai/gpt-4.1",
    "mistralai/mistral-large-latest",
    "groq/moonshotai/kimi-k2-instruct",
    "einfracz/qwen3-coder"
];

interface SearchInputProps {
    initialQuery?: string;
    onSearch: (query: string, model: string) => void;
    loading?: boolean;
    placeholder?: string;
    className?: string;
}

export const SearchInput = ({
                                initialQuery = '',
                                onSearch,
                                loading = false,
                                placeholder = "Search for data... e.g., 'climate data for the last decade'",
                                className = ""
                            }: SearchInputProps) => {
    const [query, setQuery] = useState(initialQuery);
    const [selectedModel, setSelectedModel] = useState(models[1]);
    useNavigate();
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), selectedModel);
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className="truncate w-full h-16 px-4 pr-64 text-lg text-eosc-gray font-light rounded-xl border-2 border-eosc-border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-eosc-light-blue focus:border-eosc-light-blue"
                    />
                    {SHOW_MODEL_SELECTOR && (
                        <div className="absolute right-28 top-3 w-32">
                            <ModelSelector
                                models={models}
                                selectedModel={selectedModel}
                                onModelChange={setSelectedModel}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 w-24 h-12 bg-blue-500 text-white text-lg font-light rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
};
