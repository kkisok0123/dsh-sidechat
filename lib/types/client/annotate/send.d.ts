/** Main composer gestures forward controlled quotes through the native input.
 * Admission is observed on the frozen target, rather than inferred from draft clearing.
 */
import type { Context } from '../host/contracts.ts';
export { resolveInput } from '../host/input.ts';
import type { AnnotationStore } from '../annotations/model.ts';
import { type ReflowStore } from '../reflow.ts';
export declare function installSendInterceptor(ctx: Context, store: AnnotationStore, reflow: ReflowStore): () => void;
