import axios from 'axios';
const API_FACE_DETECTION_URL = import.meta.env.VITE_API_FACE_DETECTION_URL;
const VITE_API_URI = import.meta.env.VITE_API_URI;

if (!API_FACE_DETECTION_URL) {
    throw new Error("API_FACE_DETECTION_URL is not defined in the environment variables.");
}