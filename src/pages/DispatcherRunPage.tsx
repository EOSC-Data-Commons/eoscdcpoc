import {useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {LoaderIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon} from 'lucide-react';
import {Footer} from '../components/Footer';
import dataCommonsIconBlue from '@/assets/data-commons-icon-blue.svg';
import eoscLogo from '@/assets/logo-eosc-data-commons.svg';
import {
    DispatcherType,
    StepType,
    FileMetrixFile,
    DispatcherResult
} from '../types/dispatcher';
import {
    fetchFilesFromMetrix,
    submitMetadataToDispatcher,
    pollTaskStatus
} from '../lib/dispatcherApi';
import {
    DISPATCHER_CONFIGS,
    prepareDispatcherMetadata,
    formatFileSize,
    areAllParametersMapped
} from '../lib/dispatcherUtils';

export const DispatcherRunPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Step management
    const [currentStep, setCurrentStep] = useState<StepType>('select-analysis');
    const [selectedAnalysis, setSelectedAnalysis] = useState<DispatcherType>(null);

    // File management
    const [files, setFiles] = useState<FileMetrixFile[]>([]);
    const [fileParameterMappings, setFileParameterMappings] = useState<Record<number, string>>({});
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [filesError, setFilesError] = useState<string | null>(null);

    // Submission tracking
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskResult, setTaskResult] = useState<DispatcherResult | null>(null);

    const datasetTitle = searchParams.get('title');

    // Handle analysis selection
    const handleAnalysisSelect = async (analysis: DispatcherType) => {
        if (!analysis) return;

        setSelectedAnalysis(analysis);
        setLoadingFiles(true);
        setFilesError(null);

        try {
            const config = DISPATCHER_CONFIGS[analysis];
            const data = await fetchFilesFromMetrix(config.datasetHandle);
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


    // Handle final submission
    const handleSubmit = async () => {
        if (!selectedAnalysis) return;

        try {
            setCurrentStep('submitting');
            setStatusMessage('Preparing analysis metadata...');
            setStatusType('info');

            const metadata = prepareDispatcherMetadata(
                selectedAnalysis,
                fileParameterMappings,
                files,
                datasetTitle
            );

            setStatusMessage('Submitting analysis...');
            const result = await submitMetadataToDispatcher(metadata);

            if (result.task_id) {
                setTaskId(result.task_id);
                setStatusMessage('Analysis submitted! Monitoring task progress...');
                setStatusType('info');
                setCurrentStep('monitoring');

                // Start polling
                pollTaskStatus(
                    result.task_id,
                    (status, message) => {
                        setStatusMessage(message);
                        setStatusType(status === 'SUCCESS' ? 'success' : status === 'FAILURE' ? 'error' : 'info');
                    },
                    (result) => {
                        setTaskResult(result);
                    },
                    (error) => {
                        setStatusMessage(error);
                        setStatusType('error');
                    }
                );
            }
        } catch (error) {
            console.error('Analysis submission error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatusMessage(`Error: ${errorMessage}`);
            setStatusType('error');
            setCurrentStep('map-files');
        }
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

    // Render analysis selection step
    const renderAnalysisSelection = () => (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Analysis</h2>
                <p className="text-gray-600">Choose the analysis you want to run on your dataset</p>
                {datasetTitle && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-700">Dataset:</p>
                        <p className="text-gray-900">{datasetTitle}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(DISPATCHER_CONFIGS) as [DispatcherType, typeof DISPATCHER_CONFIGS[DispatcherType]][]).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => handleAnalysisSelect(key)}
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
                        onClick={() => selectedAnalysis && handleAnalysisSelect(selectedAnalysis)}
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
        if (!selectedAnalysis) return null;

        const config = DISPATCHER_CONFIGS[selectedAnalysis];
        const allParametersMapped = areAllParametersMapped(selectedAnalysis, fileParameterMappings);

        return (
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Map Files to Analysis Parameters</h2>
                    <p className="text-gray-600">Assign each file to an analysis parameter. Each parameter must have
                        exactly one file.</p>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Selected Analysis:</p>
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
                                    Analysis Parameter
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
                            setCurrentStep('select-analysis');
                            setSelectedAnalysis(null);
                            setFiles([]);
                            setFileParameterMappings({});
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Change Analysis
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
                        <h2 className="text-xl font-semibold mb-2">Analysis Status</h2>
                        <p className="text-lg mb-4">{statusMessage}</p>

                        {selectedAnalysis && (
                            <div className="mb-4 p-4 bg-white rounded border">
                                <p className="text-sm font-medium text-gray-700 mb-1">Analysis:</p>
                                <p className="text-gray-900">{DISPATCHER_CONFIGS[selectedAnalysis].name}</p>
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
                                <p className="text-sm font-medium text-gray-700 mb-2">Analysis Ready!</p>
                                <p className="text-sm text-gray-600 mb-3">Your analysis is ready to view in Galaxy.</p>
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
                                        setCurrentStep('select-analysis');
                                        setSelectedAnalysis(null);
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
                            <div className="flex flex-col space-y-1">
                                <img
                                    src={eoscLogo}
                                    alt="EOSC Data Commons"
                                    className="h-8 w-auto"
                                />
                                <p className="text-sm text-gray-600">Dispatcher Execution</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                {currentStep === 'select-analysis' && renderAnalysisSelection()}
                {currentStep === 'map-files' && renderFileMapping()}
                {(currentStep === 'submitting' || currentStep === 'monitoring') && renderMonitoring()}
            </main>

            <Footer/>
        </div>
    );
};

