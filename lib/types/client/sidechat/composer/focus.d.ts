import type { RefObject } from 'react';
/** Only explicit composer actions/activation may reclaim focus; never a late hidden-tab callback. */
export declare function useComposerFocus(input: RefObject<HTMLTextAreaElement>, visible: boolean, identity: unknown): () => void;
