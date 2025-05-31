export const fetchWithToken = async (url: string, options: RequestInit, token: String, handleError: (message: string) => void) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error(error);
        handleError("An error occurred. Please try again later.");
        throw error;
    }
};