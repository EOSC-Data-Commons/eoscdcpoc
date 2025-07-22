import type {ZenodoHit} from "../types/zenodo.ts";

export const SearchResultItem = ({hit}: { hit: ZenodoHit }) => {
    const creators = hit.metadata.creators.map(c => c.name).join(', ');
    const description = hit.metadata.description
        ? hit.metadata.description.replace(/<p>|<\/p>/g, '')
        : 'No description available.';

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <a href={hit.links.self_html} target="_blank" rel="noopener noreferrer"
               className="text-xl font-bold text-blue-700 hover:underline">
                {hit.metadata.title}
            </a>
            <p className="text-sm text-gray-500 mt-1">
                {creators} - Published: {hit.metadata.publication_date}
            </p>
            <p className="mt-3 text-gray-700 line-clamp-3">{description}</p>
            <div className="mt-4 flex items-center gap-6 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {hit.metadata.resource_type.title}
                </span>
                <span className="text-gray-500">
                    {hit.stats.views.toLocaleString()} views
                </span>
                <span className="text-gray-500">
                    {hit.stats.downloads.toLocaleString()} downloads
                </span>
            </div>
        </div>
    );
};
