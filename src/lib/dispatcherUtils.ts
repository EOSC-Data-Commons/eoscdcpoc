// Dispatcher utility functions

import {FileMetrixFile, DispatcherConfig} from '../types/dispatcher';
import metadataTemplate from '../template/metadata-template.json';
import roCrateTemplate from '../template/ro-crate-metadata-template.json';

/**
 * Dispatcher analysis configurations
 */
export const DISPATCHER_CONFIGS: Record<string, DispatcherConfig> = {
    'text-reversion': {
        name: 'Text file reversion (Galaxy)',
        description: 'Reverse the content of a text file',
        template: metadataTemplate,
        datasetHandle: 'http://hdl.handle.net/21.T15999/01BYJvzYl',
        parameters: ['simpletext_input']
    },
    'ocr-wordcloud': {
        name: 'OCR + word cloud (Galaxy)',
        description: 'Perform OCR on an image and generate a word cloud',
        template: roCrateTemplate,
        datasetHandle: 'http://hdl.handle.net/21.T15999/JxVUdTVB',
        parameters: ['Input Image', 'Upload Stopwords']
    }
};

/**
 * Update RO-Crate with onedata extensions for a specific target
 */
export const updateOnedataForTarget = (
    inputJson: Record<string, unknown>,
    targetName: string,
    ro_crate_extensions: FileMetrixFile['ro_crate_extensions']
): Record<string, unknown> => {
    const fieldsToCopy = [
        'onedata:onezoneDomain',
        'onedata:spaceId',
        'onedata:fileId',
        'onedata:publicAccess'
    ];

    const clone = JSON.parse(JSON.stringify(inputJson)) as Record<string, unknown>;
    const graph = clone['@graph'] as Array<Record<string, unknown>>;

    for (const item of graph) {
        if (item.name === targetName) {
            for (const field of fieldsToCopy) {
                if (ro_crate_extensions[field as keyof typeof ro_crate_extensions] !== undefined) {
                    item[field] = ro_crate_extensions[field as keyof typeof ro_crate_extensions];
                }
            }
        }
    }

    return clone;
};

/**
 * Prepare final metadata with file mappings
 */
export const prepareDispatcherMetadata = (
    dispatcherType: string,
    fileParameterMappings: Record<number, string>,
    files: FileMetrixFile[],
    datasetTitle?: string | null
): Record<string, unknown> => {
    const config = DISPATCHER_CONFIGS[dispatcherType];

    if (!config) {
        throw new Error(`Invalid dispatcher type: ${dispatcherType}`);
    }

    let metadata = JSON.parse(JSON.stringify(config.template));

    // Update name and description
    if (datasetTitle && metadata['@graph'] && metadata['@graph'][0]) {
        metadata['@graph'][0].name = `${config.name} for: ${datasetTitle}`;
        metadata['@graph'][0].description = `${config.description} - Dataset: ${datasetTitle}`;
    }

    // Apply file mappings to RO-Crate
    Object.entries(fileParameterMappings).forEach(([fileIndexStr, parameter]) => {
        const fileIndex = parseInt(fileIndexStr);
        const file = files[fileIndex];

        if (file) {
            metadata = updateOnedataForTarget(metadata, parameter, file.ro_crate_extensions);
        }
    });

    console.log('Prepared metadata:', metadata);
    return metadata;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if all required analysis parameters are mapped
 */
export const areAllParametersMapped = (
    dispatcherType: string,
    fileParameterMappings: Record<number, string>
): boolean => {
    const config = DISPATCHER_CONFIGS[dispatcherType];

    if (!config) return false;

    const mappedParameters = new Set(Object.values(fileParameterMappings));

    // All analysis parameters must be mapped exactly once
    return config.parameters.every(param => mappedParameters.has(param));
};

