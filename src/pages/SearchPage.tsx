import {useNavigate, useSearchParams} from "react-router-dom";
import type {ZenodoResponse} from "../types/zenodo.ts";
import {useCallback, useEffect, useState} from "react";
import {ZENODO_API_URL} from "../lib/api.ts";
import {addToSearchHistory} from "../lib/history.ts";
import {BookIcon, LoaderIcon, XCircleIcon} from "lucide-react";
import {SearchInput} from "../components/SearchInput.tsx";
import {Pagination} from "../components/Pagination.tsx";
import {SearchResultItem} from "../components/SearchResultItem.tsx";
import {FilterPanel} from "../components/FilterPanel.tsx";

export const SearchPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = useState<ZenodoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const performSearch = useCallback(async () => {
        if (!query) {
            navigate('/');
            return;
        }

        setLoading(true);
        setError(null);

        const params = new URLSearchParams(searchParams.toString());
        params.set('size', '10'); // Set results per page
        params.set('page', page.toString());
        const accessToken = import.meta.env.ZENODO_ACCESS_TOKEN
        if (accessToken) {
            params.set('access_token', accessToken);
        }
        try {
            const response = await fetch(`${ZENODO_API_URL}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data: ZenodoResponse = await response.json();
            setResults(data);
            addToSearchHistory(query);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    const handleSearch = (newQuery: string) => {
        setSearchParams({q: newQuery, page: '1'});
    };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    const handleFilterChange = (newParams: URLSearchParams) => {
        newParams.set('q', query);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="p-4 bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
                <div className="container mx-auto flex items-center gap-4">
                    <a href="./" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                        <BookIcon className="w-7 h-7"/>
                        <span>EOSC Data Commons</span>
                    </a>
                    <div className="flex-grow">
                        <SearchInput initialQuery={query} onSearch={handleSearch} loading={loading}/>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterPanel
                        aggregations={results?.aggregations ?? {}}
                        onFilterChange={handleFilterChange}
                        activeFilters={searchParams}
                    />

                    <div className="w-full lg:w-3/4">
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-96">
                                <LoaderIcon className="w-12 h-12 text-blue-500"/>
                                <p className="mt-4 text-lg text-gray-600">Searching...</p>
                            </div>
                        )}
                        {error && (
                            <div
                                className="flex flex-col items-center justify-center h-96 bg-red-50 text-red-700 p-6 rounded-lg border border-red-200">
                                <XCircleIcon className="w-12 h-12"/>
                                <h3 className="mt-4 text-xl font-semibold">Search Failed</h3>
                                <p className="mt-2 text-center">{error}</p>
                                <button onClick={performSearch}
                                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                    Try Again
                                </button>
                            </div>
                        )}
                        {!loading && !error && results && (
                            <>
                                <div className="mb-4 text-gray-600">
                                    <p>Showing <strong>{(page - 1) * 10 + 1}-{Math.min(page * 10, results.hits.total)}</strong> of <strong>{results.hits.total.toLocaleString()}</strong> results
                                        for "<strong>{query}</strong>"</p>
                                </div>
                                <div className="space-y-4">
                                    {results.hits.hits.length > 0 ? (
                                        results.hits.hits.map(hit => <SearchResultItem key={hit.id} hit={hit}/>)
                                    ) : (
                                        <div className="text-center py-20">
                                            <h3 className="text-2xl font-semibold text-gray-700">No results found</h3>
                                            <p className="text-gray-500 mt-2">Try adjusting your search query or
                                                filters.</p>
                                        </div>
                                    )}
                                </div>
                                <Pagination
                                    page={page}
                                    size={10}
                                    total={results.hits.total}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};