import type { Context, SessionBinding, SessionInput } from './contracts.ts';
/** Only an actual observed admission confirms this session generation. */
export declare function hasConfirmedAcceptance(binding: SessionBinding | undefined): boolean;
export interface SubmissionReceipt {
    readonly outcome: Promise<void>;
    /** Subscribe first, then invoke exactly one native submit. */
    submit(mode?: 'queue' | 'steer'): void;
    dispose(): void;
}
/** Observe real target admission, never an empty draft or pendingSubmissions echo.
 * The baseline excludes earlier identical quotes and fork-inherited history. */
export declare function prepareSubmission(ctx: Context, sessionId: string, input: SessionInput, needle: string): Promise<SubmissionReceipt>;
