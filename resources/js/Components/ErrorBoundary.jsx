import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught an error", error, info);
    }

    // The id the server stamped on the document response, so a user can quote
    // the same reference that appears in the logs.
    get requestId() {
        return this.props.requestId ?? document.querySelector('meta[name="request-id"]')?.content ?? null;
    }

    render() {
        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
                <h1 className="text-lg font-semibold text-gray-900">Something went wrong.</h1>
                <p className="text-sm text-gray-500">
                    Please refresh the page. If the problem persists, contact support with the reference below.
                </p>
                {this.requestId && <p className="text-xs text-gray-400">Reference: {this.requestId}</p>}
            </div>
        );
    }
}
