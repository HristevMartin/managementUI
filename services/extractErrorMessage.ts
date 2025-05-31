export function extractErrorMessage(error: string) {
    const validationPattern = /Validation errors: (.+)/;
    const fetchErrorPattern = /Error fetching role data: Failed to fetch data: 400 - (.+)/;

    let match = validationPattern.exec(error);
    if (match) {
        return match[1];
    }

    match = fetchErrorPattern.exec(error);
    if (match) {
        return match[1];
    }

    return "Please try again later.";
}