import { User } from '.prisma/client'
import { useEffect } from 'react'
import useSWR from 'swr'
import { useSetUser, useUser } from '../../core/context/UserContext'
import request from '../../core/request'

const meFetcher = (url: string) => request({ url, method: 'GET' })

const AuthWrapper: React.FC<{}> = ({ children }) => {
	const user = useUser()
	const setUser = useSetUser()

	const { data } = useSWR('/api/me', meFetcher, { refreshInterval: 10000 })

	useEffect(() => {
		if (data?.user) {
			setUser(data?.user as User)
		}
	}, [data])

	return user ? <>{children}</> : null
}

export default AuthWrapper
