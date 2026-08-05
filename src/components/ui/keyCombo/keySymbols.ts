import { isMacosSync } from '@common/platform'

const KEY_SYMBOLS: Record<string, { mac: string; other: string }> = {
  CommandOrControl: { mac: '⌘', other: 'Ctrl' },
  Control: { mac: '⌃', other: 'Ctrl' },
  Shift: { mac: '⇧', other: '⇧' },
  Alt: { mac: '⌥', other: 'Alt' },
  ArrowUp: { mac: '↑', other: '↑' },
  ArrowDown: { mac: '↓', other: '↓' },
  ArrowLeft: { mac: '←', other: '←' },
  ArrowRight: { mac: '→', other: '→' },
  PageUp: { mac: '⇞', other: '⇞' },
  PageDown: { mac: '⇟', other: '⇟' },
  ' ': { mac: 'Space', other: 'Space' },
}

/** Formats a single accelerator part (e.g. `CommandOrControl`, `K`) into its
 * platform-appropriate display symbol, falling back to the raw part for keys
 * with no dedicated symbol (letters, digits, function keys, ...). */
export const formatKeyPart = (part: string): string =>
  KEY_SYMBOLS[part]?.[isMacosSync() ? 'mac' : 'other'] ?? part
