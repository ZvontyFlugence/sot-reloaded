import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
	// Enable JWT
	session: {
		strategy: 'jwt',
	},
	// Authentication Providers
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email', placeholder: 'Email' },
				password: { label: 'Password', type: 'password' },
				ip: { type: 'text' },
			},
			authorize: async (credentials, _req) => {
				const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
					method: 'POST',
					body: JSON.stringify({ ...credentials }),
				}).then((data) => data.json())

				if (res?.user && res?.token) {
					let user = JSON.parse(res.user)
					return user
				}

				return null
			},
		}),
	],
	// Custom Authentication Pages
	pages: {
		signIn: '/login',
	},
	// Authentication Flow Hooks
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id
			}

			return token
		},
		session: async ({ session, token }) => {
			if (token) {
				session.user.id = token.id as number
			}

			return session
		},
	},
	secret: process.env.AUTH_SECRET,
	jwt: {
		secret: process.env.JWT_SECRET,
	},
})
