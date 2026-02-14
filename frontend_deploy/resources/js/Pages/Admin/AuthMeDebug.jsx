import React, { useEffect } from 'react';

export default function AuthMeDebug() {
    useEffect(() => {
        fetch('/api/auth/me', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                console.log('API /api/auth/me response:', data);
                alert(JSON.stringify(data));
            })
            .catch(err => {
                console.error('API /api/auth/me error:', err);
                alert('Error: ' + err);
            });
    }, []);
    return <div>Check the console and alert for /api/auth/me response.</div>;
}
