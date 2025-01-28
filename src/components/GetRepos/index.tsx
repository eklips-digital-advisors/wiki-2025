import React, { } from 'react'
import { Dropdown } from '@/components/Dropdown'

export const Index: React.FC = async () => {
  const auth = Buffer.from(process.env.BEANSTALK_USR + ":" + process.env.BEANSTALK_PWD).toString('base64');

  const headers = {
    Authorization: "Basic " + auth,
    ContentType: "application/json",
    UserAgent: "Wiki"
  };

  const response = await fetch(process.env.BEANSTALK_URL || '', {
    headers: headers,
  });
  const data = await response.json();

  const fetchedOptions = data.map((item: {
    title: string,
    id: number,
    repository: { title: string, id: string }
  }) => {
    const { repository } = item;

    return {
      label: repository.title,
      value: repository.id,
    };
  })

  return (
    <Dropdown label="Repository" path="repository" fetchedOptions={fetchedOptions} />
  )
}
