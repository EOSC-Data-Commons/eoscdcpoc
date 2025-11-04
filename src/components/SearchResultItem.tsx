import type {BackendDataset} from "../types/commons.ts";
import {CalendarIcon, UserIcon, ExternalLinkIcon, TagIcon} from "lucide-react";
import {ProportionalStar} from './ProportionalStar';
import {CitationExport} from './CitationExport';

interface SearchResultItemProps {
    hit: BackendDataset;
    isAiRanked?: boolean;
}

export const SearchResultItem = ({hit, isAiRanked = false}: SearchResultItemProps) => {
    const cleanDescription = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.length > 300 ? text.substring(0, 300) + '...' : text;
    };

    const scorePercent = (hit.score || 0) * 100;

    // For research accuracy, only use official publication dates (Issued/Created), not metadata dates
    const getPublicationDate = (): string | null => {
        // First priority: root-level publicationDate field (if not null)
        if (hit.publicationDate) {
            return hit.publicationDate;
        }

        // Second priority: look for "Issued" date in _source.dates (official publication)
        if (hit._source.dates && hit._source.dates.length > 0) {
            const issuedDate = hit._source.dates.find(d => d.dateType === 'Issued');
            if (issuedDate) return issuedDate.date;

            // Third priority: "Available" date (when it became publicly available)
            const availableDate = hit._source.dates.find(d => d.dateType === 'Available');
            if (availableDate) return availableDate.date;

            // Fourth priority: "Created" date (when content was created)
            // This is important for unpublished datasets - the creation date is citation-worthy
            const createdDate = hit._source.dates.find(d => d.dateType === 'Created');
            if (createdDate) return createdDate.date;
        }

        // Last resort: use publicationYear if available (show just the year)
        if (hit._source.publicationYear) {
            return hit._source.publicationYear;
        }

        return null;
    };

    const publicationDate = getPublicationDate();

    const formatDate = (dateStr: string): string => {
        // If it's just a year (4 digits), return as-is
        if (/^\d{4}$/.test(dateStr)) {
            return dateStr;
        }
        // Otherwise format as YYYY.MM.DD
        return new Date(dateStr).toISOString().slice(0, 10).replace(/-/g, '.');
    };

    return (
        <div className={`rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
            isAiRanked
                ? 'bg-white border-gray-200'
                : 'bg-gray-100 border-gray-300'
        }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 pr-4 mb-2 sm:mb-0">
                    {hit.title}
                </h3>
                {isAiRanked && hit.score !== undefined && (
                    <div className="flex-shrink-0 flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <ProportionalStar percent={scorePercent} className="h-4 w-4"/>
                        <span className="text-sm font-medium text-yellow-700">
                            {scorePercent.toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
                {cleanDescription(hit.description)}
            </p>

            <div className="space-y-2 mb-4">
                {hit._source.creators?.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-500"/>
                        <span className="text-sm text-gray-600">
                            {hit._source.creators.map(creator => creator.creatorName).slice(0, 3).join(', ')}
                            {hit._source.creators.length > 3 && ` +${hit._source.creators.length - 3} more`}
                        </span>
                    </div>
                )}

                {publicationDate && (
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500"/>
                        <span className="text-sm text-gray-600">
                            {formatDate(publicationDate)}
                        </span>
                    </div>
                )}

                {hit._source.subjects && hit._source.subjects.length > 0 && (
                    <div className="flex items-start space-x-2">
                        <TagIcon className="h-4 w-4 text-gray-500 mt-0.5"/>
                        <div className="flex flex-wrap gap-1">
                            {hit._source.subjects.slice(0, 5).map((subj, index) => (
                                <span key={index}
                                      className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                                    {subj.subject}
                                </span>
                            ))}
                            {hit._source.subjects.length > 5 && (
                                <span className="text-xs text-gray-500">
                                    +{hit._source.subjects.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div
                className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4 sm:gap-0">
                <div className="flex space-x-4">
                    <a href={hit._id} target="_blank" rel="noopener noreferrer"
                       aria-label={`View dataset ${hit.title}`}
                       className="inline-flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors">
                        <ExternalLinkIcon className="h-4 w-4"/>
                        <span className="leading-none">View</span>
                    </a>
                    <CitationExport dataset={hit}/>
                </div>
                {isAiRanked && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">AI-powered search</span>
                )}
            </div>
        </div>
    );
};