/** Track mounted conversation boxes without measuring their descendants. */
export function observeConversationSizes(notify: () => void): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {}
  const observer = new ResizeObserver(notify)
  const observed = new Set<Element>()
  const refresh = (): void => {
    const views = new Set(document.querySelectorAll('[data-conversation-session], [data-sidechat-chat-session]'))
    for (const view of observed) if (!views.has(view)) { observer.unobserve(view); observed.delete(view) }
    for (const view of views) if (!observed.has(view)) { observer.observe(view); observed.add(view) }
  }
  const mutations = new MutationObserver(refresh)
  mutations.observe(document.body, { childList: true, subtree: true })
  refresh()
  return () => { mutations.disconnect(); observer.disconnect(); observed.clear() }
}
