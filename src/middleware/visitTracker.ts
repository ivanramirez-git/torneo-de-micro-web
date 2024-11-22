import api from '../stores/api';

export async function trackVisit() {
    try {
        const visit = {
            fechaVisita: new Date().toISOString(),
        };

        await api.post('/visitas', visit);
    } catch (error) {
        console.error('Error tracking visit:', error);
    }
}
