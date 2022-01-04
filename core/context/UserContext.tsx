import {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useState,
} from 'react'
import { User } from '.prisma/client'

interface IUserContext {
	user: User | undefined
	setUser: Dispatch<SetStateAction<User | undefined>>
}

const UserContext = createContext<IUserContext>({
	user: undefined,
	setUser: () => {},
})

interface UserProviderProps {
	user: User | undefined
}

export const UserProvider: React.FC<UserProviderProps> = ({
	children,
	user,
}) => {
	const [userState, setUserState] = useState<User | undefined>(user)

	return (
		<UserContext.Provider value={{ user: userState, setUser: setUserState }}>
			{children}
		</UserContext.Provider>
	)
}

// Used to get the User state throughout the app
export const useUser = () => {
	const context = useContext(UserContext)

	if (context === undefined)
		throw new Error('`useUser` must be used within a UserProvider')

	return context.user
}

// Used to set new User state (usually optimistic updates that will be overriden)
export const useSetUser = () => {
	const context = useContext(UserContext)

	if (context === undefined)
		throw new Error('`useSetUser` must be used within a UserProvider')

	return (user: User) => {
		context.setUser(user)
	}
}
