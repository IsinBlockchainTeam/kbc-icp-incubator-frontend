import { useCallback } from 'react';

export type OrderSpec = {
    supplier;
};

// TODO: una volta ricavate le informazioni complete delle compagnie partner, posso andare a creare l'oggetto json standard per le fatture (su discord) insieme alle altre informazioni negoziate
// ora ICP non ritornerà più solamente il nome della compagnia ma anche le altre informazioni che mi servono
export default () => {
    const generateContract = useCallback(async () => {}, []);
};
