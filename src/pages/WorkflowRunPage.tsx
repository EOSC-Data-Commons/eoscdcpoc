import {useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {LoaderIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon} from 'lucide-react';
import {Footer} from '../components/Footer';
import dataCommonsIconBlue from '@/assets/data-commons-icon-blue.svg';
import metadataTemplate from '../template/metadata-template.json';
import roCrateTemplate from '../template/ro-crate-metadata-template.json';

// Use proxy in development to avoid CORS issues
const API_BASE = import.meta.env.DEV ? '/player-api' : 'https://dev3.player.eosc-data-commons.eu';
const METADATA_ENDPOINT = '/anon_requests/metadata_rocrate/';
const FILEMETRIX_BASE = 'https://filemetrix.labs.dansdemo.nl/api/v1';

type TaskStatus = 'PENDING' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'STARTED';

interface WorkflowResult {
    url?: string;
}

interface TaskStatusResponse {
    status: TaskStatus;
    result?: WorkflowResult;
    error?: string;
}

type WorkflowType = 'text-reversion' | 'ocr-wordcloud' | null;

type StepType = 'select-workflow' | 'map-files' | 'submitting' | 'monitoring';

interface FileMetrixFile {
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

interface FileMetrixResponse {
    files: FileMetrixFile[];
}


const WORKFLOW_CONFIGS = {
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
} as const;

export const WorkflowRunPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Step management
    const [currentStep, setCurrentStep] = useState<StepType>('select-workflow');
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>(null);

    // File management
    const [files, setFiles] = useState<FileMetrixFile[]>([]);
    const [fileParameterMappings, setFileParameterMappings] = useState<Record<number, string>>({});
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [filesError, setFilesError] = useState<string | null>(null);

    // Submission tracking
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskResult, setTaskResult] = useState<WorkflowResult | null>(null);

    const datasetTitle = searchParams.get('title');

    // Fetch files from FileMetrix API
    const fetchFiles = async (workflow: WorkflowType) => {
        if (!workflow) return;

        setLoadingFiles(true);
        setFilesError(null);

        try {
            const config = WORKFLOW_CONFIGS[workflow];
            const response = await fetch(`${FILEMETRIX_BASE}/${encodeURIComponent(config.datasetHandle)}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch files: ${response.status}`);
            }

            const data: FileMetrixResponse = await response.json();
            setFiles(data.files);
            setCurrentStep('map-files');
        } catch (error) {
            console.error('Error fetching files:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setFilesError(`Failed to load files: ${errorMessage}`);
        } finally {
            setLoadingFiles(false);
        }
    };

    // Handle workflow selection
    const handleWorkflowSelect = (workflow: WorkflowType) => {
        setSelectedWorkflow(workflow);
        fetchFiles(workflow);
    };

    // Handle parameter mapping change
    const handleParameterChange = (fileIndex: number, parameter: string) => {
        setFileParameterMappings(prev => {
            const newMappings = {...prev};

            // Remove this parameter from any other file
            Object.keys(newMappings).forEach(key => {
                if (newMappings[parseInt(key)] === parameter) {
                    delete newMappings[parseInt(key)];
                }
            });

            // Set new mapping (or remove if 'none')
            if (parameter === 'none') {
                delete newMappings[fileIndex];
            } else {
                newMappings[fileIndex] = parameter;
            }

            return newMappings;
        });
    };

    // Check if all required parameters are mapped
    const canProceed = (): boolean => {
        if (!selectedWorkflow) return false;

        const config = WORKFLOW_CONFIGS[selectedWorkflow];
        const mappedParameters = new Set(Object.values(fileParameterMappings));

        // All workflow parameters must be mapped exactly once
        return config.parameters.every(param => mappedParameters.has(param));
    };

    // Update RO-Crate with file mappings
    const updateOnedataForTarget = (
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

    // Prepare final metadata with file mappings
    const prepareMetadata = () => {
        if (!selectedWorkflow) {
            throw new Error('No workflow selected');
        }

        const config = WORKFLOW_CONFIGS[selectedWorkflow];
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

    // Submit metadata to dispatcher
    const submitMetadata = async (metadata: unknown) => {
        try {
            console.log('Submitting metadata:', JSON.stringify(metadata, null, 2));

            const response = await fetch(`${API_BASE}${METADATA_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Response result:', result);

                if (result.task_id) {
                    setTaskId(result.task_id);
                    setStatusMessage('Workflow submitted! Monitoring task progress...');
                    setStatusType('info');
                    setCurrentStep('monitoring');
                    pollTaskStatus(result.task_id);
                }
            } else {
                const errorText = await response.text();
                console.error('Submission error:', errorText);
                throw new Error(`Submission failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Submit metadata error:', error);
            throw new Error(`Failed to submit metadata: ${errorMessage}`);
        }
    };

    // Poll task status
    const pollTaskStatus = async (taskId: string) => {
        const pollInterval = 2000;
        const maxAttempts = 60;
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(`${API_BASE}/anon_requests/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const statusResult: TaskStatusResponse = await response.json();

                    switch (statusResult.status) {
                        case 'SUCCESS':
                            setStatusMessage('Workflow completed successfully!');
                            setStatusType('success');
                            setTaskResult(statusResult.result || null);
                            return;

                        case 'FAILURE':
                            setStatusMessage(`Workflow failed: ${statusResult.error || 'Unknown error'}`);
                            setStatusType('error');
                            return;

                        case 'PENDING':
                        case 'STARTED':
                        case 'RETRY':
                            setStatusMessage(`Task status: ${statusResult.status}. Please wait...`);
                            setStatusType('info');
                            break;
                    }

                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(poll, pollInterval);
                    } else {
                        setStatusMessage('Task monitoring timeout.');
                        setStatusType('warning');
                    }
                } else {
                    throw new Error(`Status check failed: ${response.status}`);
                }
            } catch (error) {
                console.error('Polling error:', error);
                if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, pollInterval);
                } else {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    setStatusMessage(`Error checking task status: ${errorMessage}`);
                    setStatusType('error');
                }
            }
        };

        setTimeout(poll, pollInterval);
    };

    // Handle final submission
    const handleSubmit = async () => {
        try {
            setCurrentStep('submitting');
            setStatusMessage('Preparing workflow metadata...');
            setStatusType('info');

            const metadata = prepareMetadata();

            setStatusMessage('Submitting workflow...');
            await submitMetadata(metadata);

        } catch (error) {
            console.error('Workflow submission error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatusMessage(`Error: ${errorMessage}`);
            setStatusType('error');
            setCurrentStep('map-files');
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getStatusIcon = () => {
        switch (statusType) {
            case 'success':
                return <CheckCircleIcon className="h-8 w-8 text-green-600"/>;
            case 'error':
                return <XCircleIcon className="h-8 w-8 text-red-600"/>;
            case 'warning':
                return <AlertCircleIcon className="h-8 w-8 text-yellow-600"/>;
            default:
                return <LoaderIcon className="h-8 w-8 text-blue-600 animate-spin"/>;
        }
    };

    const getStatusColorClass = () => {
        switch (statusType) {
            case 'success':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'error':
                return 'text-red-700 bg-red-50 border-red-200';
            case 'warning':
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            default:
                return 'text-blue-700 bg-blue-50 border-blue-200';
        }
    };

    // Render workflow selection step
    const renderWorkflowSelection = () => (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Analysis Workflow</h2>
                <p className="text-gray-600">Choose the workflow you want to run on your dataset</p>
                {datasetTitle && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-700">Dataset:</p>
                        <p className="text-gray-900">{datasetTitle}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(WORKFLOW_CONFIGS) as [WorkflowType, typeof WORKFLOW_CONFIGS[WorkflowType]][]).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => handleWorkflowSelect(key)}
                        disabled={loadingFiles}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.name}</h3>
                        <p className="text-sm text-gray-600">{config.description}</p>
                    </button>
                ))}
            </div>

            {loadingFiles && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                    <LoaderIcon className="h-5 w-5 text-blue-600 animate-spin"/>
                    <p className="text-blue-900">Loading files from FileMetrix...</p>
                </div>
            )}

            {filesError && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-900">{filesError}</p>
                    <button
                        onClick={() => selectedWorkflow && fetchFiles(selectedWorkflow)}
                        className="mt-3 text-sm text-red-700 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            <div className="mt-6">
                <button
                    onClick={() => navigate('/search?q=' + (searchParams.get('q') || ''))}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    ← Back to Search Results
                </button>
            </div>
        </div>
    );

    // Render file mapping step
    const renderFileMapping = () => {
        if (!selectedWorkflow) return null;

        const config = WORKFLOW_CONFIGS[selectedWorkflow];
        const allParametersMapped = canProceed();

        return (
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Map Files to Workflow Parameters</h2>
                    <p className="text-gray-600">Assign each file to a workflow parameter. Each parameter must have
                        exactly one file.</p>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Selected Workflow:</p>
                        <p className="text-gray-900 font-semibold">{config.name}</p>
                    </div>
                </div>

                {/* Required Parameters Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Parameters:</p>
                    <div className="flex flex-wrap gap-2">
                        {config.parameters.map(param => {
                            const isMapped = Object.values(fileParameterMappings).includes(param);
                            return (
                                <span
                                    key={param}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isMapped
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {param} {isMapped ? '✓' : '⚠'}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Files List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Workflow Parameter
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {files.map((file, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {file.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatFileSize(file.size)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={fileParameterMappings[index] || 'none'}
                                            onChange={(e) => handleParameterChange(index, e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            <option value="none">None</option>
                                            {config.parameters.map(param => (
                                                <option key={param} value={param}>
                                                    {param}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={() => {
                            setCurrentStep('select-workflow');
                            setSelectedWorkflow(null);
                            setFiles([]);
                            setFileParameterMappings({});
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Change Workflow
                    </button>

                    <div className="flex items-center gap-4">
                        {!allParametersMapped && (
                            <p className="text-sm text-yellow-700">
                                Please map all required parameters to proceed
                            </p>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={!allParametersMapped}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Workflow
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render submitting/monitoring step
    const renderMonitoring = () => (
        <div className="max-w-3xl mx-auto">
            <div className={`rounded-lg border-2 p-8 ${getStatusColorClass()}`}>
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        {getStatusIcon()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-2">Workflow Status</h2>
                        <p className="text-lg mb-4">{statusMessage}</p>

                        {selectedWorkflow && (
                            <div className="mb-4 p-4 bg-white rounded border">
                                <p className="text-sm font-medium text-gray-700 mb-1">Workflow:</p>
                                <p className="text-gray-900">{WORKFLOW_CONFIGS[selectedWorkflow].name}</p>
                            </div>
                        )}

                        {datasetTitle && (
                            <div className="mb-4 p-4 bg-white rounded border">
                                <p className="text-sm font-medium text-gray-700 mb-1">Dataset:</p>
                                <p className="text-gray-900">{datasetTitle}</p>
                            </div>
                        )}

                        {taskId && (
                            <div className="mb-4 p-4 bg-white rounded border">
                                <p className="text-sm font-medium text-gray-700 mb-1">Task ID:</p>
                                <p className="text-gray-900 font-mono text-sm">{taskId}</p>
                            </div>
                        )}

                        {taskResult && taskResult.url && (
                            <div className="mb-4 p-4 bg-white rounded border">
                                <p className="text-sm font-medium text-gray-700 mb-2">Workflow Ready!</p>
                                <p className="text-sm text-gray-600 mb-3">Your workflow is ready to view in Galaxy.</p>
                                <button
                                    onClick={() => window.open(taskResult.url, '_blank', 'noopener,noreferrer')}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors cursor-pointer"
                                >
                                    Take me to Galaxy →
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mt-6">
                            <button
                                onClick={() => navigate('/search?q=' + (searchParams.get('q') || ''))}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                Back to Search Results
                            </button>

                            {statusType === 'error' && (
                                <button
                                    onClick={() => {
                                        setCurrentStep('select-workflow');
                                        setSelectedWorkflow(null);
                                        setFiles([]);
                                        setFileParameterMappings({});
                                        setTaskId(null);
                                        setTaskResult(null);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                    Start Over
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                            <img src={dataCommonsIconBlue} alt="Data Commons" className="h-10 w-10"/>
                            <div>
                                <h1 className="text-2xl font-bold" style={{color: '#005EB8'}}>
                                    EOSC Data Commons
                                </h1>
                                <p className="text-sm text-gray-600">Workflow Execution</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                {currentStep === 'select-workflow' && renderWorkflowSelection()}
                {currentStep === 'map-files' && renderFileMapping()}
                {(currentStep === 'submitting' || currentStep === 'monitoring') && renderMonitoring()}
            </main>

            <Footer/>
        </div>
    );
};

