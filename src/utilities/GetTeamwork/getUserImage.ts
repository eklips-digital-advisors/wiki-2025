export async function getUserImage(email?: string) {
    if (!email) return

    const API_KEY = process.env.TEAMWORK_API_KEY;
    const API_URL = `${process.env.TEAMWORK_BASE_URL}/people.json`;

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${btoa(`${API_KEY}:`)}`, // Encode API key for authentication
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching users: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const users = data.people;
        const user = users.find((u: any) => u['email-address'] === email);

        if (user) {
            // console.log(`User found: ${user['first-name']} ${user['last-name']}`);
            return user;
        } else {
            // console.log("User not found.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}
