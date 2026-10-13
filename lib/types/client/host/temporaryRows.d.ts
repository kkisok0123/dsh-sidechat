/** DSH 0.2.0-rc.2's workspace row seam. Presentation only: no archived/running state is changed. */
export declare function installTemporaryWorkspaceRows(source: {
    list(): string[];
    subscribe(listener: () => void): () => void;
}): () => void;
