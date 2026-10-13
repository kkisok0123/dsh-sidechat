/** View-only side-session identity. Never archive, delete, or alter the host's session authority. */
export declare const TEMPORARY_SIDE_KEY = "dsh-sidechat:temporary-sessions:v1";
export declare function createTemporarySideRegistry(storage: Storage | null): {
    list: () => string[];
    mark: (childId: string, parentSessionId: string) => void;
    refresh: () => void;
    subscribe(listener: () => void): () => void;
};
export declare function temporarySideRegistry(): {
    list: () => string[];
    mark: (childId: string, parentSessionId: string) => void;
    refresh: () => void;
    subscribe(listener: () => void): () => void;
};
export declare function markTemporarySideChat(childId: string, parentSessionId: string): void;
/** Import only explicit plugin metadata, never guess from titles or fork ancestry. */
export declare function migrateTemporarySideChats(storage: Storage | null, target?: {
    list: () => string[];
    mark: (childId: string, parentSessionId: string) => void;
    refresh: () => void;
    subscribe(listener: () => void): () => void;
}): void;
