import type { NativeTabRecord } from './contracts.ts';
/** Public TabDomain navigation revision: 0 means restored/seeded, positive
 * means opened by address. Unknown shapes cannot reclaim another generation. */
export declare function isRestoredNativeTab(record: NativeTabRecord): boolean;
