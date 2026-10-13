import { useEffect, useRef, useState } from 'react'
import { Menu, type MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import { IconCheckOutline16, IconChevronDownOutline14 } from '../host/icons.ts'
import type { Context, SessionModelsResult } from '../host/contracts.ts'
import { listModels, selectModelConfirmed } from '../host/models.ts'
import { t } from '../locales.ts'
import { useLocaleTick } from '../locale-tick.ts'
import css from './sidechat.module.css'

/** The server-confirmed provider/model pair, never the display name, owns the checkmark. */
export function ModelMenu(props: {
  ctx: Context
  sessionId: string
  modelName: string | null
  onSwitched: (name: string) => void
  onRestoreInput?: () => void
}) {
  useLocaleTick()
  const [open, setOpen] = useState(false)
  const [models, setModels] = useState<SessionModelsResult | null>(null)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const epoch = useRef(0)
  const busy = useRef(false)
  useEffect(() => {
    const request = ++epoch.current
    busy.current = false
    setOpen(false); setModels(null); setError(null); setSwitching(false)
    // Include provider identity in the collapsed label even before the first click.
    void listModels(props.ctx, props.sessionId).then(value => {
      if (request === epoch.current) setModels(value)
    }).catch(() => {})
    return () => { epoch.current++ }
  }, [props.ctx, props.sessionId])

  const openMenu = (): void => {
    setOpen(true)
    setError(null)
    const request = ++epoch.current
    // Re-read on EVERY opening: another view may have changed this child.
    void listModels(props.ctx, props.sessionId).then((value) => {
      if (request !== epoch.current) return
      setModels(value)
      if (value === null) setError(t('modelCatalogFailed'))
    }).catch((cause: unknown) => {
      if (request === epoch.current) setError(cause instanceof Error ? cause.message : t('modelCatalogFailed'))
    })
  }

  const group = models?.groups.find(group => group.id === models.current.provider)
  const selectedName = group?.models.find(model => model.id === models?.current.model)?.name
  const label = group === undefined ? props.modelName ?? t('modelFollowsMain')
    : `${group.name} · ${selectedName ?? models?.current.model}`
  const items: MenuEntry[] = []
  for (const group of models?.groups ?? []) {
    items.push({ type: 'label', id: `g:${group.id}`, text: group.name })
    for (const model of group.models) {
      const selected = models?.current.provider === group.id && models.current.model === model.id
      items.push({ id: JSON.stringify([group.id, model.id]), label: model.name,
        ...(selected ? { icon: <IconCheckOutline16 size={12} /> } : {}) })
    }
  }

  return <>
    <Menu open={open} side="top" portal compact
      anchor={<button type="button" className={css.modelSelect} title={t('modelSwitchTitle')}
        disabled={switching} aria-busy={switching}
        onClick={() => { open ? setOpen(false) : openMenu() }}>
        <span>{t('modelLabel', { name: label })}</span><IconChevronDownOutline14 size={12} />
      </button>}
      items={items} onClose={() => { setOpen(false) }}
      onSelect={(id) => {
        if (busy.current || models === null) return
        // Resolve an actual entry rather than splitting provider IDs on '/'.
        const choice = models.groups.flatMap(group => group.models.map(model => ({ provider: group.id, model: model.id })))
          .find(choice => JSON.stringify([choice.provider, choice.model]) === id)
        if (choice === undefined) return
        busy.current = true
        const request = ++epoch.current
        setOpen(false); setSwitching(true); setError(null)
        void selectModelConfirmed(props.ctx, props.sessionId, choice.provider, choice.model).then(selected => {
          if (request !== epoch.current) return
          setModels(current => current === null ? null : { ...current, current: selected })
          props.onSwitched(selected.model)
        }).catch((cause: unknown) => {
          if (request === epoch.current) setError(cause instanceof Error ? cause.message : t('modelSwitchFailed'))
        }).finally(() => {
          if (request !== epoch.current) return
          busy.current = false; setSwitching(false)
          props.onRestoreInput?.()
        })
      }} />
    {error !== null && <span role="alert" className={css.errorRow}>{error}</span>}
  </>
}
