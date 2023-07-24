import { firestoreDb } from '../utils/firebase.js';

const getConfig = async () => {
    const config = firestoreDb.getDoc('Config', 'ApiGateway');
    return config
};

export default getConfig