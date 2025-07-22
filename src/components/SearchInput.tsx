import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Search as SearchIcon} from 'lucide-react';
import {Loader as LoaderIcon} from "lucide-react";


interface SearchInputProps {
    initialQuery?: string;
    onSearch: (query: string) => void;
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
    useNavigate();
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSearch} className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="w-full h-16 px-4 pr-28 text-lg text-eosc-gray font-light rounded-xl border-2 border-eosc-border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-eosc-light-blue focus:border-eosc-light-blue"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 w-24 h-12 bg-eosc-light-blue text-white text-lg font-light rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-eosc-light-blue focus:ring-offset-2"
                >
                    Search
                </button>
                {loading ? <LoaderIcon/> : <SearchIcon/>}
            </form>
        </div>
    );
};
