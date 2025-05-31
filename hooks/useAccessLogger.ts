import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AccessLogData {
    page: string;
    userAgent: string;
    timestamp: string;
    clientIP?: string;
}

const useAccessLogger = (pageName?: string) => {
    const pathname = usePathname();

    useEffect(() => {
        const logAccess = async () => {
            try {
                // Try to get client IP from external service as fallback
                let detectedClientIP;
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json');
                    console.log('ipResponse', ipResponse);
                    const ipData = await ipResponse.json();
                    detectedClientIP = ipData.ip;
                } catch (error) {
                    console.log('Could not fetch external IP:', error);
                }

                const accessData: AccessLogData = {
                    page: pageName || pathname || 'unknown',
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    clientIP: detectedClientIP,
                };

                console.log('accessData', accessData);

                const apiResponse = await fetch(`http://localhost:8080/travel/save-user-track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(accessData),
                });

                if (apiResponse.ok) {
                    console.log('Access logged successfully');
                } else {
                    console.error('Failed to log access');
                }

                console.log('Access logged successfully:', accessData);
            } catch (error) {
                console.error('Error logging access:', error);
            }
        };

        // Log access when component mounts
        logAccess();
    }, [pathname, pageName]);
};

export default useAccessLogger; 