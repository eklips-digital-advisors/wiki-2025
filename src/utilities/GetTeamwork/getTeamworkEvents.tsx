import React from 'react';

export const GetTeamworkEvents = async (): Promise<any[]> => {
  const API_KEY = process.env.TEAMWORK_API_KEY;
  const BASE_URL = process.env.TEAMWORK_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    console.error("Environment variables TEAMWORK_API_KEY or TEAMWORK_BASE_URL are not set.");
    return [];
  }

  // Calculate dates
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 1);

  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 3);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  const API_URL = `${BASE_URL}/projects/api/v3/calendar/events.json?startDate=${start}&endDate=${end}&pageSize=500`;

  try {
    const headers = {
      'Authorization': `Basic ${btoa(`${API_KEY}:`)}`, // Encode API key for authentication
      'Content-Type': 'application/json'
    };

    const response = await fetch(API_URL, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return (data.calendarEvents || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
    }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};
