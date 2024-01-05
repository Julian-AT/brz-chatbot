import { ReactNode, createContext, useContext } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

interface UserSettings {
  model_uri: string
  model_name: string
  bottom_glow: boolean
}

const { DEFAULT_MODEL_NAME, DEFAULT_MODEL_URL } = process.env

const defaultSettings: UserSettings = {
  model_uri: DEFAULT_MODEL_NAME || 'https://api.openai.com/v1/',
  model_name: DEFAULT_MODEL_URL || 'gpt-3.5-turbo',
  bottom_glow: true
}

const SettingsContext = createContext<{
  settings: UserSettings
  setSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => void
}>({
  settings: defaultSettings,
  setSetting: () => {}
})

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children
}) => {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'userSettings',
    defaultSettings
  )

  const setSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const updatedSettings: UserSettings = { ...defaultSettings, ...settings }
    updatedSettings[key] = value
    setSettings(updatedSettings)
  }

  return (
    <SettingsContext.Provider
      value={{ settings: settings || defaultSettings, setSetting }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
