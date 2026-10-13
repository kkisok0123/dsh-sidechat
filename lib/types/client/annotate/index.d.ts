import type { Context } from '../host/contracts.ts';
import type { AnnotationStore } from '../annotations/model.ts';
import type { ReflowStore } from '../reflow.ts';
import { currentSessionIdOf } from '../host/currentSession.ts';
export { currentSessionIdOf };
export declare function registerAnnotations(ctx: Context, reflow: ReflowStore, store: AnnotationStore): void;
