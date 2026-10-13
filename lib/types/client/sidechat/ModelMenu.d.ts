import type { Context } from '../host/contracts.ts';
/** The server-confirmed provider/model pair, never the display name, owns the checkmark. */
export declare function ModelMenu(props: {
    ctx: Context;
    sessionId: string;
    modelName: string | null;
    onSwitched: (name: string) => void;
    onRestoreInput?: () => void;
}): import("react").JSX.Element;
