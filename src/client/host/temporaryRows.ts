/** DSH 0.2.0-rc.2's workspace row seam. Presentation only: no archived/running state is changed. */
export function installTemporaryWorkspaceRows(source: { list(): string[]; subscribe(listener: () => void): () => void }): () => void {
  const style = document.createElement('style')
  style.dataset.sidechatTemporaryRows = ''
  const update = (): void => {
    const selectors = source.list().filter(id => /^[A-Za-z0-9._:-]+$/.test(id))
      .map(id => `[role="treeitem"][data-row-key=${JSON.stringify(`session:${id}`)}]`)
    style.textContent = selectors.length === 0 ? '' : `${selectors.join(',\n')} { display: none !important; }`
  }
  update()
  document.head.append(style)
  const unsubscribe = source.subscribe(update)
  return () => { unsubscribe(); style.remove() }
}
