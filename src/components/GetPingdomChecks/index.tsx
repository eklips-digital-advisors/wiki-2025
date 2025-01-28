import React, { } from 'react'
import { Dropdown } from '@/components/Dropdown'

export const Index: React.FC = async () => {
  const headers = {
    authorization: "Bearer " + process.env.PINGDOM_TOKEN,
  };

  const response = await fetch(process.env.PINGDOM_URL || '', {
    headers: headers,
  });
  const data = await response.json();

  const fetchedOptions = data?.checks.map((item: {
    name: string,
    id: number,
    repository: { name: string, id: string }
  }) => {
    return {
      label: item.name,
      value: item.id,
    };
  })

  return (
    <Dropdown label="Pingdom" path="pingdom" fetchedOptions={fetchedOptions} />
  )
}
