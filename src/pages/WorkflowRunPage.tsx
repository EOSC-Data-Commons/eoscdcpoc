import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {LoaderIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon} from 'lucide-react';
import {Footer} from '../components/Footer';
import dataCommonsIconBlue from '@/assets/data-commons-icon-blue.svg';
import metadataTemplate from '../template/metadata-template.json';

// Use proxy in development to avoid CORS issues
const API_BASE = import.meta.env.DEV ? '/player-api' : 'https://dev3.player.eosc-data-commons.eu';
const METADATA_ENDPOINT = '/anon_requests/metadata_rocrate/';

type TaskStatus = 'PENDING' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'STARTED';

interface WorkflowResult {
    url?: string;
}

interface TaskStatusResponse {
    status: TaskStatus;
    result?: WorkflowResult;
    error?: string;
}

export const WorkflowRunPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState('Initializing...');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskResult, setTaskResult] = useState<WorkflowResult | null>(null);

    const datasetId = searchParams.get('datasetId');
    const datasetTitle = searchParams.get('title');

    const prepareMetadata = () => {
        const metadata = JSON.parse(JSON.stringify(metadataTemplate));

        if (datasetTitle && metadata['@graph'] && metadata['@graph'][0]) {
            metadata['@graph'][0].name = `Workflow for: ${datasetTitle}`;
            metadata['@graph'][0].description = `Workflow execution for dataset: ${datasetTitle}`;
        }

        console.log('Prepared metadata:', metadata);
        return metadata;
    };

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
                            setTaskResult(statusResult.result);
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

    const startWorkflowSubmission = async () => {
        try {

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
        }
    };

    useEffect(() => {
        if (!datasetId) {
            setStatusMessage('No dataset selected');
            setStatusType('error');
            return;
        }

        startWorkflowSubmission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datasetId]);

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
                <div className="max-w-3xl mx-auto">
                    <div className={`rounded-lg border-2 p-8 ${getStatusColorClass()}`}>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                {getStatusIcon()}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold mb-2">Workflow Status</h2>
                                <p className="text-lg mb-4">{statusMessage}</p>


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
                                        <p className="text-sm text-gray-600 mb-3">Your workflow is ready to view in
                                            Galaxy.</p>
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
                                        onClick={() => navigate('/search?q=' + searchParams.get('q'))}
                                        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                                    >
                                        Back to Search Results
                                    </button>

                                    {statusType === 'error' && (
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors cursor-pointer"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    );
};

