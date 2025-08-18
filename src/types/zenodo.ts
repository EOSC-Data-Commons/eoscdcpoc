// Backend API types
export interface BackendDataset {
    creators: string[];
    description: string;
    doi: string;
    id: string | number;
    keywords: string[] | null;
    publication_date: string;
    resource_type: string
    score: number;
    title: string;
    zenodo_url: string;
}

export interface BackendSearchResponse {
    hits: BackendDataset[];
    summary: string;
}

// Legacy Zenodo types (keeping for compatibility if needed)
export interface ZenodoHit {
    id: number;
    created: string;
    modified: string;
    doi: string;
    doi_url: string;
    conceptrecid: string;
    conceptdoi: string;
    metadata: {
        title: string;
        doi: string;
        publication_date: string;
        description: string;
        access_right: string;
        creators: Array<{
            name: string;
            affiliation?: string;
        }>;
        custom?: {
            [key: string]: unknown;
        };
        resource_type: {
            title: string;
            type: string;
            subtype?: string;
        };
        license?: {
            id: string;
        };
        relations?: unknown;
    };
}

export interface ZenodoResponse {
    hits: {
        hits: ZenodoHit[];
        total: number;
    };
    links: {
        self: string;
        next?: string;
        prev?: string;
    };
}

export interface AggregationBucket {
    key: string;
    label: string;
    doc_count: number;
}

export interface AggregationSection {
    label: string;
    buckets: AggregationBucket[];
}

export interface Aggregations {
    [key: string]: AggregationSection;
}
