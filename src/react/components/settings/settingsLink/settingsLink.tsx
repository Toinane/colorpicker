import style from './settingsLink.module.css'

export interface SettingsLinkProps {
  href: string
  label: string
}

const SettingsLink = ({ href, label }: SettingsLinkProps) => {
  return (
    <a href={href} className={style.settingsLink} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}

export default SettingsLink
