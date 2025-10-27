// Backend API types - matching Python SearchHit structure

export interface SearchHitSrcCreator {
    creatorName: string;
}

export interface SearchHitSrcSubject {
    subject: string;
    lang?: string | null;
    subject_scheme?: string | null;
    schemaUri?: string | null;
    valueUri?: string | null;
    classificationCode?: string | null;
}

export interface SearchHitSrcTitle {
    title: string;
}

export interface SearchHitSrcDescription {
    description: string;
    lang?: string | null;
    descriptionType?: string | null;
}

export interface SearchHitSrcDate {
    date: string;
    dateType: string;
}

export interface SearchHitSrc {
    doi?: string | null;
    url?: string | null;
    titles: SearchHitSrcTitle[];
    descriptions: SearchHitSrcDescription[];
    publicationYear: string;
    dates?: SearchHitSrcDate[] | null;
    subjects?: SearchHitSrcSubject[] | null;
    creators?: SearchHitSrcCreator[] | null;
    resourceType?: string;
}

export interface BackendDataset {
    _id: string;
    _source: SearchHitSrc;
    opensearch_score: number;
    score?: number | null;
    file_extensions?: string[] | null;
    title?: string | null;
    description?: string | null;
    publicationDate?: string | null;
    creator?: string | null;
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
