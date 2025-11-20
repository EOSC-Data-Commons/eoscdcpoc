// Dispatcher-related types

export type TaskStatus = 'PENDING' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'STARTED';

export interface DispatcherResult {
    url?: string;
}

export interface TaskStatusResponse {
    status: TaskStatus;
    result?: DispatcherResult;
    error?: string;
}

export type DispatcherType = 'text-reversion' | 'ocr-wordcloud' | null;

export type StepType = 'select-analysis' | 'map-files' | 'submitting' | 'monitoring';

export interface FileMetrixFile {
    link: string;
    name: string;
    size: number;
    hash: string | null;
    hash_type: string;
    ro_crate_extensions: {
        'onedata:onezoneDomain': string;
        'onedata:spaceId': string;
        'onedata:fileId': string;
        'onedata:publicAccess': boolean;
    };
}

export interface FileMetrixResponse {
    files: FileMetrixFile[];
}

export interface DispatcherConfig {
    name: string;
    description: string;
    template: Record<string, unknown>;
    datasetHandle: string;
    parameters: string[];
}

