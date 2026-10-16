import type { Context } from '../host/contracts.ts';
/** Only committed admission advances the cursor; failed sends can safely retry. */
export declare function mainlineUpdate(ctx: Context, parentId: string, afterSeq: number): {
    block: string;
    through: number;
};
