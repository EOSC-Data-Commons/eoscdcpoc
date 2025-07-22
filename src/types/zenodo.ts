export interface ZenodoHit {
    id: number;
    created: string;
    modified: string;
    doi: string;
    metadata: {
        title: string;
        publication_date: string;
        description: string;
        creators: { name: string; affiliation: string | null }[];
        resource_type: {
            title: string;
            type: string;
        };
    };
    links: {
        self_html: string;
    };
    stats: {
        views: number;
        downloads: number;
    }
}

export interface AggregationBucket {
    key: string;
    doc_count: number;
    label: string;
    is_selected: boolean;
    inner?: {
        buckets: AggregationBucket[];
    }
}

export interface Aggregations {
    [key: string]: {
        buckets: AggregationBucket[];
        label: string;
    };
}

export interface ZenodoResponse {
    hits: {
        hits: ZenodoHit[];
        total: number;
    };
    aggregations: Aggregations;
    links: {
        self: string;
        next?: string;
        prev?: string;
    }
}