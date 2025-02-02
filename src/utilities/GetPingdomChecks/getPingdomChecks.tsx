import React from 'react';
import { Dropdown } from '@/components/Dropdown';

export const GetPingdomChecks: React.FC = async () => {
  try {
    const headers = {
      authorization: `Bearer ${process.env.PINGDOM_TOKEN}`,
    };

    const url = process.env.PINGDOM_URL;
    if (!url) throw new Error("PINGDOM_URL is not set");

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const fetchedOptions = data?.checks?.map((item: { name: string; id: number }) => ({
      label: item.name,
      value: item.id,
    })) || [];

    return <Dropdown label="Pingdom" path="integrations.pingdom" fetchedOptions={fetchedOptions} />;
  } catch (error) {
    console.error("Error fetching Pingdom checks:", error);
    return <p>Failed to load Pingdom checks.</p>;
  }
};
