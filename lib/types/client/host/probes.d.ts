import type { Context } from './contracts.ts';
import { type CapabilityState, type InputReason } from './input.ts';
export type DiagnosticReason = InputReason | 'waitView' | 'waitDock' | 'waitSide' | 'unknownAcceptance' | 'markersMissing';
export interface Capability {
    id: string;
    name: 'selection' | 'dock' | 'sideOpen' | 'sideQuote' | 'input' | 'sideInput' | 'acceptance' | 'sideAcceptance' | 'chat' | 'model';
    state: CapabilityState;
    reason: DiagnosticReason;
    path: string;
}
export interface HostReport {
    versions: {
        sidechat: string;
        dsh: string;
        betterSidebar: string | null;
    };
    capabilities: readonly Capability[];
}
export interface HostDiagnostics {
    getSnapshot(): HostReport;
    subscribe(fn: () => void): () => void;
    recheck(): void;
    dockRegistered(): void;
}
/** A report contains software facts only: no session IDs, prompts, URLs or paths. */
export declare function hostDiagnostics(ctx: Context): HostDiagnostics;
/** Recheck at service readiness and view changes; absence at boot is waiting. */
export declare function watchHostDiagnostics(ctx: Context): () => void;
export declare function probeHost(ctx: Context): number;
