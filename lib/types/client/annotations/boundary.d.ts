import { Component, type ReactNode } from 'react';
/** Crash guard: a render failure must never take the host page down. */
export declare class AnnotationBoundary extends Component<{
    children: ReactNode;
}, {
    failed: boolean;
}> {
    state: {
        failed: boolean;
    };
    static getDerivedStateFromError(): {
        failed: boolean;
    };
    componentDidCatch(error: unknown): void;
    render(): ReactNode;
}
