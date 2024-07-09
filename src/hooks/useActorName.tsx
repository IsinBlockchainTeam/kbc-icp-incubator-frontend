import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { NotificationType, openNotification } from '@/utils/notification';
import { DID_METHOD } from '@/constants/ssi';
import { ICPContext } from '@/providers/ICPProvider';

export default function useActorName() {
    const dispatch = useDispatch();
    const { getNameByDID } = useContext(ICPContext);

    const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());
    const updateActorNames = (address: string, name: string) => {
        setActorNames(new Map(actorNames.set(address, name)));
    };

    const getActorName = async (address: string): Promise<string> => {
        if (!address) return 'Unknown';
        if (actorNames.has(address)) {
            return actorNames.get(address)!;
        }
        try {
            dispatch(showLoading('Retrieving actor name...'));
            const name = await getNameByDID(`${DID_METHOD}:${address}`);
            updateActorNames(address, name);
            return name;
        } catch (e: any) {
            openNotification('Error', 'Error while retrieving actor name', NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
        return 'Unknown';
    };

    return {
        getActorName
    };
}
