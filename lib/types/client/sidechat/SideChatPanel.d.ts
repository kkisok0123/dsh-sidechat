import type { TabComponentProps, NativeTabFrameworkProps } from '../host/contracts.ts';
import type { ReflowStore } from '../reflow.ts';
import type { AnnotationStore } from '../annotations/model.ts';
export declare function SideChatPanel(props: TabComponentProps & {
    reflow: ReflowStore;
    annotations: AnnotationStore;
    quoteRequestId?: string;
    nativeConversation?: Pick<NativeTabFrameworkProps, 'SessionProvider' | 'renderSlot'>;
}): import("react").JSX.Element;
