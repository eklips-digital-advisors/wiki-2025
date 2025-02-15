import React from 'react'

type Props = {
  embed?: string | null
}

export const EmbedBlock: React.FC<Props> = (props) => {
  const {
    embed
  } = props

  return (
    <div dangerouslySetInnerHTML={{ __html: embed || 'No content' }} />
  )
}
