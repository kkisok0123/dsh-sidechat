import { elementOf, mainMessageOf, mainAnchorBodies, NON_QUOTE, quoteClipOf, focusMainComposer, nativeSideAssistantBodies } from '../host/dom.ts'

export interface QuoteSource {
  body: HTMLElement
  anchor: HTMLElement
  view: HTMLElement
  sessionId: string
  parentSessionId?: string
  surface: 'main' | 'side'
  streaming: boolean
  key?: string
}

/** Explicit side bodies are the sole exception to the legacy sidebar exclusion. */
export function quoteSourceOf(node: Node, currentSessionId: string): QuoteSource | null {
  const element = elementOf(node)
  if (element?.closest(NON_QUOTE) !== null) return null
  const nativeView = element?.closest<HTMLElement>('[data-sidechat-native-conversation]')
  if (nativeView !== undefined && nativeView !== null) {
    const source = mainMessageOf(node, currentSessionId)
    const sessionId = nativeView.dataset.sidechatChatSession
    if (source === null || !sessionId) return null
    return { ...source, view: nativeView, sessionId, surface: 'side', parentSessionId: nativeView.dataset.sidechatParentSession }
  }
  const body = element?.closest<HTMLElement>('[data-sidechat-quote-body]')
  if (body !== undefined && body !== null) {
    const anchor = body.closest<HTMLElement>('[data-sidechat-message-key][data-sidechat-message-role="assistant"]')
    const view = body.closest<HTMLElement>('[data-sidechat-chat-session]')
    const sessionId = view?.dataset.sidechatChatSession
    if (!sessionId || anchor === null || view === null) return null
    return { body, anchor, view, sessionId, parentSessionId: view.dataset.sidechatParentSession, surface: 'side', key: anchor.dataset.sidechatMessageKey, streaming: body.dataset.sidechatStreaming === 'true' }
  }
  if (element?.closest('[data-dsh-better-sidebar], [data-dsh-sidechat], [data-sidechat-chat-session]') !== null) return null
  return mainMessageOf(node, currentSessionId)
}

export function sourceKey(source: QuoteSource): string | undefined {
  return source.key
}

export function sourceBodies(sessionId: string, surface: 'main' | 'side', anchorKey: string, currentSessionId: string): HTMLElement[] {
  if (surface === 'main') return mainAnchorBodies(sessionId, anchorKey, currentSessionId)
  return [...document.querySelectorAll<HTMLElement>('[data-sidechat-quote-body]'), ...nativeSideAssistantBodies()].filter(body => {
    const source = quoteSourceOf(body, currentSessionId)
    return source?.sessionId === sessionId && sourceKey(source) === anchorKey
  })
}

/** The same text-node projection is used at capture and when rebuilding anchors.
 * Browser selections contain block newlines; anchor offsets deliberately do not. */
export function quoteTextNodes(body: HTMLElement): Text[] {
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest(NON_QUOTE) !== null) continue
    if (node.parentElement !== null && getComputedStyle(node.parentElement).userSelect === 'none') continue
    nodes.push(node as Text)
  }
  return nodes
}

export function projectedRangeText(body: HTMLElement, range: Range): string {
  return quoteTextNodes(body).map(node => {
    if (!range.intersectsNode(node)) return ''
    const start = node === range.startContainer ? range.startOffset : 0
    const end = node === range.endContainer ? range.endOffset : node.length
    return node.data.slice(start, end)
  }).join('')
}

export function selectedQuoteText(range: Range, browserText: string, anchorText: string): string {
  if (browserText.replace(/\s/g, '') === anchorText.replace(/\s/g, '')) return browserText
  const fragment = range.cloneContents()
  for (const element of fragment.querySelectorAll(NON_QUOTE)) element.remove()
  const textOf = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node instanceof Element && node.tagName === 'BR') return '\n'
    const text = [...node.childNodes].map(textOf).join('')
    return node instanceof Element && /^(P|DIV|LI|PRE|BLOCKQUOTE|H[1-6])$/.test(node.tagName) ? text + '\n' : text
  }
  return textOf(fragment).trimEnd()
}

export function sourceClip(source: QuoteSource) { return quoteClipOf(source.body, source.view) }

export function focusSourceComposer(source: QuoteSource): void {
  if (source.surface === 'main') focusMainComposer(source.view)
  else if (source.view.hasAttribute('data-sidechat-native-conversation')) focusMainComposer(source.view)
  else source.view.querySelector<HTMLTextAreaElement>('[data-sidechat-composer] textarea')?.focus()
}
