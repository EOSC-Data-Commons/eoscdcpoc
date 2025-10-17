import type {BackendDataset} from "../types/commons.ts";
import {CalendarIcon, UserIcon, ExternalLinkIcon, TagIcon} from "lucide-react";
import {ProportionalStar} from './ProportionalStar';
import {CitationExport} from './CitationExport';

interface SearchResultItemProps {
    hit: BackendDataset;
}

export const SearchResultItem = ({hit}: SearchResultItemProps) => {
    const cleanDescription = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.length > 300 ? text.substring(0, 300) + '...' : text;
    };

    const scorePercent = (hit.score || 0) * 100;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {hit.title}
                </h3>
                <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <ProportionalStar percent={scorePercent} className="h-4 w-4"/>
                    <span className="text-sm font-medium text-yellow-700">
                        {scorePercent.toFixed(0)}%
                    </span>
                </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
                {cleanDescription(hit.description)}
            </p>

            <div className="space-y-2 mb-4">
                {hit.creators?.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-500"/>
                        <span className="text-sm text-gray-600">
                            {hit.creators.slice(0, 3).join(', ')}
                            {hit.creators.length > 3 && ` +${hit.creators.length - 3} more`}
                        </span>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500"/>
                    <span className="text-sm text-gray-600">
                        {new Date(hit.publication_date).toISOString().slice(0, 10).replace(/-/g, '.')}
                    </span>
                </div>

                {hit.keywords && hit.keywords.length > 0 && (
                    <div className="flex items-start space-x-2">
                        <TagIcon className="h-4 w-4 text-gray-500 mt-0.5"/>
                        <div className="flex flex-wrap gap-1">
                            {hit.keywords.slice(0, 5).map((keyword, index) => (
                                <span key={index}
                                      className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                    {keyword}
                                </span>
                            ))}
                            {hit.keywords.length > 5 && (
                                <span className="text-xs text-gray-500">
                                    +{hit.keywords.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-4">
                    <a href={hit.url} target="_blank" rel="noopener noreferrer"
                       aria-label={`View dataset ${hit.title}`}
                       className="inline-flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors">
                        <ExternalLinkIcon className="h-4 w-4"/>
                        <span className="leading-none">View</span>
                    </a>
                    <CitationExport dataset={hit}/>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">AI-powered search</span>
            </div>
        </div>
    );
};