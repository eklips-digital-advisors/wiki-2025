import React from 'react';
import { DropdownValueAsLabel } from '@/components/DropdownValueAsLabel'
import { Dropdown } from '@/components/Dropdown'

export const GetProjects: React.FC = async () => {
  const API_KEY = process.env.TEAMWORK_API_KEY;
  const API_URL = `${process.env.TEAMWORK_BASE_URL}/projects/api/v3/projects.json`;

  try {
    if (!process.env.TEAMWORK_API_KEY) {
      throw new Error("TEAMWORK_API_KEY is not set in environment variables.");
    }

    const headers = {
      'Authorization': `Basic ${btoa(`${API_KEY}:`)}`, // Encode API key for authentication
      'Content-Type': 'application/json'
    };

    const response = await fetch(API_URL, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const fetchedOptions =
      data?.projects?.map((item: { name: string; id: string }) => ({
        label: item.name,
        value: item.id,
      })) || [];

    return <Dropdown label="Project" path="projectTeamwork" fetchedOptions={fetchedOptions} />;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return <p>Failed to load projects.</p>;
  }
};
