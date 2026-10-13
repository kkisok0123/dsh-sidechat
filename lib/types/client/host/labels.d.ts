/** TerminalBlockLabels（0.1.1 与 0.1.2 同形状）。 */
export declare function terminalLabels(): {
    signal: (signal: string) => string;
    exitCode: (code: number) => string;
    running: string;
    failed: string;
    done: string;
    copy: string;
    copied: string;
    noOutput: string;
    collapseAria: string;
    collapse: string;
    expandAria: (n: number) => string;
    expand: (n: number) => string;
};
/** ReadBlockLabels（0.1.2 必填）。 */
export declare function readLabels(): {
    window: (shown: number, total: number) => string;
    copy: string;
    copied: string;
    collapseAria: string;
    expandAria: (n: number) => string;
    collapse: string;
    expand: (n: number) => string;
};
/** SearchBlockLabels（0.1.2 必填）。 */
export declare function searchLabels(): {
    pathsSummary: (shown: number, total: number, truncated: boolean) => string;
    matchesSummary: (shown: number, total: number, files: number, truncated: boolean) => string;
    copy: string;
    copied: string;
    noResults: string;
    collapseAria: string;
    expandAria: (n: number) => string;
    collapse: string;
    expand: (n: number) => string;
};
/** DiffBlockLabels（0.1.2 必填）。 */
export declare function diffLabels(): {
    copy: string;
    copied: string;
    collapseAria: string;
    expandAria: (n: number) => string;
    collapse: string;
    expand: (n: number) => string;
    files: (n: number) => string;
};
/** WebBlockLabels（0.1.2 必填；markdown 子面复用双形状 chrome）。 */
export declare function webLabels(): {
    noResults: string;
    sourcesTruncated: string;
    http: string;
    contentTruncated: string;
    markdown: import("./markdown.ts").MarkdownChrome;
};
/** JsonTreeLabels（0.1.5 必填：label + labels 全套）。 */
export declare function jsonTreeLabels(): {
    copyValue: string;
    copyJson: string;
    copyPath: string;
    copyPrettyJson: string;
    copyCompactJson: string;
    copied: string;
    copyFailed: string;
    collapseNode: string;
    expandNode: string;
    copyButtonTitle: (action: string) => string;
};
