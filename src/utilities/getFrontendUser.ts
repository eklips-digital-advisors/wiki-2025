export const getFrontendUser = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    return result.user ?? null
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
};
