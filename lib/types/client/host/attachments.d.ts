import type { Context, SessionInput } from './contracts.ts';
interface Preview {
    readonly id: string;
    readonly previewUrl: string;
}
/** Image intake only; serialization and lifecycle stay owned by native submit. */
export interface AttachmentApis {
    createDraftImages(files: readonly File[]): readonly Preview[];
    draftImages(ids: readonly string[]): readonly Preview[];
    releaseDraftImage(id: string): void;
}
export declare function resolveAttachmentApis(ctx: Context, sessionId?: string): AttachmentApis | null;
export declare function attachFiles(apis: AttachmentApis, input: SessionInput, files: readonly File[]): boolean;
export {};
