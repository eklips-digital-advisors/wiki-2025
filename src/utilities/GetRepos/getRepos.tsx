import React from 'react';
import { Dropdown } from '@/components/Dropdown';

export const GetRepos: React.FC = async () => {
  try {
    if (!process.env.BEANSTALK_URL) {
      throw new Error("BEANSTALK_URL is not set in environment variables.");
    }

    const auth = Buffer.from(
      `${process.env.BEANSTALK_USR}:${process.env.BEANSTALK_PWD}`
    ).toString('base64');

    const headers = {
      Authorization: `Basic ${auth}`,
      ContentType: 'application/json',
      UserAgent: 'Wiki',
    };

    const response = await fetch(`${process.env.BEANSTALK_URL}repositories.json`, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const fetchedOptions =
      data?.map((item: { repository: { title: string; id: string } }) => ({
        label: item.repository.title,
        value: item.repository.id,
      })) || [];

    return <Dropdown label="Repository" path="integrations.repository" fetchedOptions={fetchedOptions} />;
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return <p>Failed to load repositories.</p>;
  }
};
