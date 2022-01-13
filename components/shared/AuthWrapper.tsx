import { User } from '.prisma/client';
import { useEffect } from 'react';
import useSWR from 'swr';
import { useSetUser } from '../../core/context/UserContext';
import request from '../../core/request';

const meFetcher = (url: string) => request({ url, method: 'GET' });

const AuthWrapper: React.FC<{}> = ({ children }) => {
	const setUser = useSetUser();

	const { data } = useSWR('/api/me', meFetcher, { refreshInterval: 10000 });

	useEffect(() => {
		if (data?.user) {
			setUser(data?.user as User);
		}
	}, [data]);

	return <>{children}</>;
};

export default AuthWrapper;
