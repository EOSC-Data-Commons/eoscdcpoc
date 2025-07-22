const SEARCH_HISTORY_KEY = 'zenodoSearchHistory';

export const getSearchHistory = (): string[] => {
    try {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error("Failed to parse search history:", error);
        return [];
    }
};

export const addToSearchHistory = (query: string) => {
    if (!query) return;
    try {
        const history = getSearchHistory();
        const updatedHistory = [query, ...history.filter(item => item !== query)].slice(0, 10); // Keep latest 10
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save search history:", error);
    }
};