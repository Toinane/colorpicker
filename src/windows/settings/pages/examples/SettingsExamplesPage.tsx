/**
 * Example Component: Complete Settings Implementation
 *
 * This file demonstrates all the different ways to use the settings system.
 * It's a reference implementation showing best practices.
 */

import { memo, useCallback, useState } from 'react'
import {
  useSetting,
  useSettings,
  useOpenAtLogin,
  useKeepOnTop,
  useThemeSetting,
  useDebouncedSetting,
  useSettingWatcher,
  useAllSettings,
} from '@hooks/index'

/**
 * Example 1: Simple single setting
 */
const SimpleSettingExample = memo(() => {
  const [theme, setTheme] = useSetting('theme')

  return (
    <div>
      <h3>Simple Setting Example</h3>
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <p>Current theme: {theme}</p>
    </div>
  )
})

/**
 * Example 2: Multiple settings at once
 */
const MultipleSettingsExample = memo(() => {
  const { values, updateSettings } = useSettings(['keepOnTop', 'showHistory', 'maxHistorySize'])

  const handleToggleKeepOnTop = async () => {
    await updateSettings({ keepOnTop: !values.keepOnTop })
  }

  const handleToggleHistory = async () => {
    await updateSettings({ showHistory: !values.showHistory })
  }

  return (
    <div>
      <h3>Multiple Settings Example</h3>
      <label>
        <input type="checkbox" checked={values.keepOnTop} onChange={handleToggleKeepOnTop} />
        Keep on top
      </label>
      <label>
        <input type="checkbox" checked={values.showHistory} onChange={handleToggleHistory} />
        Show history
      </label>
      <label>
        Max history size: {values.maxHistorySize}
        <input
          type="range"
          min={10}
          max={200}
          value={values.maxHistorySize}
          onChange={(e) => updateSettings({ maxHistorySize: Number(e.target.value) })}
        />
      </label>
    </div>
  )
})

/**
 * Example 3: Special OS integration (openAtLogin)
 */
const OpenAtLoginExample = memo(() => {
  const [openAtLogin, setOpenAtLogin] = useOpenAtLogin()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback(
    async (checked: boolean) => {
      setIsUpdating(true)
      setError(null)

      try {
        await setOpenAtLogin(checked)
      } catch (err) {
        setError('Failed to update open at login setting')
        console.error(err)
      } finally {
        setIsUpdating(false)
      }
    },
    [setOpenAtLogin],
  )

  return (
    <div>
      <h3>Open at Login Example (OS Integration)</h3>
      <label>
        <input
          type="checkbox"
          checked={openAtLogin}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={isUpdating}
        />
        Open at login {isUpdating && '(updating...)'}
      </label>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
})

/**
 * Example 4: Debounced setting (for frequent updates)
 */
const DebouncedSettingExample = memo(() => {
  const [maxHistorySize, setMaxHistorySize] = useDebouncedSetting('maxHistorySize', 500)

  return (
    <div>
      <h3>Debounced Setting Example</h3>
      <p>Max history size: {maxHistorySize}</p>
      <input
        type="range"
        min={10}
        max={200}
        value={maxHistorySize}
        onChange={(e) => setMaxHistorySize(Number(e.target.value))}
      />
      <p>
        <small>Updates are sent to Electron after 500ms of inactivity</small>
      </p>
    </div>
  )
})

/**
 * Example 5: Using specialized hooks
 */
const SpecializedHooksExample = memo(() => {
  const [keepOnTop, setKeepOnTop] = useKeepOnTop()
  const [theme, setTheme] = useThemeSetting()

  return (
    <div>
      <h3>Specialized Hooks Example</h3>
      <label>
        <input
          type="checkbox"
          checked={keepOnTop}
          onChange={(e) => setKeepOnTop(e.target.checked)}
        />
        Keep window on top
      </label>
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
})

/**
 * Example 6: Watching for changes
 */
const SettingWatcherExample = memo(() => {
  const [changeLog, setChangeLog] = useState<string[]>([])

  // Watch theme changes
  useSettingWatcher('theme', (theme) => {
    setChangeLog((prev) => [...prev, `Theme changed to: ${theme}`])
  })

  // Watch keepOnTop changes
  useSettingWatcher('keepOnTop', (keepOnTop) => {
    setChangeLog((prev) => [...prev, `Keep on top: ${keepOnTop}`])
  })

  return (
    <div>
      <h3>Setting Watcher Example</h3>
      <p>Change log:</p>
      <ul>
        {changeLog.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  )
})

/**
 * Example 7: All settings at once
 */
const AllSettingsExample = memo(() => {
  const { settings, updateSettings, resetSettings, isLoading, error } = useAllSettings()

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      await resetSettings()
    }
  }

  if (isLoading) return <p>Loading settings...</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div>
      <h3>All Settings Example</h3>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
      <button onClick={handleReset}>Reset All Settings</button>
    </div>
  )
})

/**
 * Main example component combining all examples
 */
const SettingsExamplesPage = memo(() => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Settings System Examples</h1>
      <p>
        This page demonstrates all the different ways to use the settings synchronization system.
      </p>

      <hr />
      <SimpleSettingExample />

      <hr />
      <MultipleSettingsExample />

      <hr />
      <OpenAtLoginExample />

      <hr />
      <DebouncedSettingExample />

      <hr />
      <SpecializedHooksExample />

      <hr />
      <SettingWatcherExample />

      <hr />
      <AllSettingsExample />
    </div>
  )
})

export default SettingsExamplesPage
