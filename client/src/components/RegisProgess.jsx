import React, { useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_FACE_DETECTION_URL;

const RegistrationProgress = ({camera_id}) => {
    const [progressMessages, setProgressMessages] = useState([]);

    useEffect(() => {
        // Reset messages when camera_id changes or component mounts
        setProgressMessages([]);
        // Establish the SSE connection
        const eventSource = new EventSource(`${API_BASE_URL}/registration_events`,{
            withCredentials: true
        });

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received SSE message:', data);
            if (data.camera_id === camera_id) {
                const allowedStatuses = ['success', 'error', 'progress'];
                if (allowedStatuses.includes(data.status)) {
                    // setProgressMessages(prevMessages => [...prevMessages, data]);
                    setProgressMessages([data]);
                }
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            console.error('CLIENT: EventSource readyState on error:', eventSource.readyState);
            eventSource.close();
        };

        eventSource.onopen = () => {
            console.log('SSE connection opened.');
        };

        return () => {
            eventSource.close();
            console.log('SSE connection closed.');
        }


    }, [camera_id]);

    return (
        <div>
            <h2>Registration Progress:</h2>
            {progressMessages.length === 0 ? (
                <p>Waiting for registration events...</p>
            ) : (
                <ul>
                    {progressMessages.map((msg, index) => (
                        <li key={index} className={msg.status}>
                            <strong>{msg.status.toUpperCase()}:</strong> {msg.message}
                            {msg.collected !== undefined && msg.required !== undefined &&
                                ` (${msg.collected}/${msg.required} collected)`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default RegistrationProgress;