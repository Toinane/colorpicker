import style from './ExternalLink.module.css'

import Text from '../text/Text'

export interface ExternalLinkProps {
  href: string
  label: string
}

const ExternalLink = ({ href, label }: ExternalLinkProps) => {
  return (
    <a href={href} className={style.externalLink} target="_blank" rel="noopener noreferrer">
      <Text>{label}</Text>
    </a>
  )
}

export default ExternalLink
