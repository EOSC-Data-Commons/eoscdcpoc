import React from 'react';
import {getUserErrorMessage, logError} from '../lib/utils.ts';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: unknown;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error: Error) {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error) {
        logError(error, 'React ErrorBoundary');
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-100 text-red-800 rounded">
                    <h2 className="font-bold mb-2">Something went wrong.</h2>
                    <pre className="whitespace-pre-wrap text-xs">{getUserErrorMessage(this.state.error)}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

