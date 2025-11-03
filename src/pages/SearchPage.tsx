import {useNavigate, useSearchParams} from "react-router-dom";
import type {BackendSearchResponse} from "../types/commons.ts";
import {useCallback, useEffect, useState} from "react";
import {searchWithBackend} from "../lib/api.ts";
import {addToSearchHistory} from "../lib/history.ts";
import {BookIcon, LoaderIcon, XCircleIcon} from "lucide-react";
import {SearchInput} from "../components/SearchInput.tsx";
import {SearchResultItem} from "../components/SearchResultItem.tsx";
import {AlphaDisclaimer} from "../components/AlphaDisclaimer";
import {Footer} from "../components/Footer";
import dataCommonsIconBlue from '@/assets/data-commons-icon-blue.svg';

export const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState<BackendSearchResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const query = searchParams.get('q') || '';
    const model = searchParams.get('model') || 'einfracz/qwen3-coder';

    const performSearch = useCallback(async () => {
        if (!query) {
            navigate('/');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await searchWithBackend(query, model);
            setResults(data);
            addToSearchHistory(query);
        } catch (err) {
            console.error("Search error:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, [query, model, navigate]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    const handleSearch = (newQuery: string, newModel: string) => {
        setSearchParams({q: newQuery, model: newModel});
    };

    const datasets = results?.hits || [];
    const summary = results?.summary || '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <AlphaDisclaimer/>
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
                    <img
                        src={dataCommonsIconBlue}
                        alt="EOSC Logo"
                        className="h-9 w-auto cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                    <div className="flex-grow ml-4">
                        <SearchInput onSearch={handleSearch} initialQuery={query} initialModel={model}/>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary only after results arrive and no loading */}
                {!loading && !error && summary && (
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Summary</h3>
                        <p className="text-gray-700">{summary}</p>
                    </div>
                )}

                <div className="flex gap-8">
                    <div className="flex-1 relative" aria-busy={loading} aria-live="polite">
                        {/* Loading overlay */}
                        {loading && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 rounded-lg">
                                <div className="flex items-center space-x-2 text-gray-700">
                                    <LoaderIcon className="h-6 w-6 animate-spin text-blue-600"/>
                                    <span className="text-sm sm:text-base">Searching datasets...</span>
                                </div>
                            </div>
                        )}

                        {/* Error state inline */}
                        {!loading && error && (
                            <div
                                className="p-6 bg-white rounded-lg shadow-sm border border-red-200 text-center space-y-4">
                                <XCircleIcon className="h-12 w-12 text-red-500 mx-auto"/>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h2>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <button
                                        onClick={performSearch}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Results (hidden from screen readers while loading to prevent duplicate announcements) */}
                        <div
                            className={loading ? 'opacity-0 pointer-events-none select-none' : 'opacity-100 transition-opacity'}
                            aria-hidden={loading}>
                            {!loading && !error && (
                                datasets.length === 0 ? (
                                    <div
                                        className="text-center py-12 bg-white/60 rounded-lg border border-dashed border-gray-300">
                                        <BookIcon className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets found</h3>
                                        <p className="text-gray-600">Try adjusting your search terms or filters.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <p className="text-gray-600">
                                                Found {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            {datasets.map((dataset, index) => (
                                                <SearchResultItem
                                                    key={`${dataset.id}-${index}`}
                                                    hit={dataset}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
            {/* Footer only when results list is present */}
            {!loading && (
                <Footer translucent/>
            )}
        </div>
    );
};
