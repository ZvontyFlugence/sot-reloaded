import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Center, Text } from '@chakra-ui/layout'
import { useToast } from '@chakra-ui/toast'
import { GetServerSideProps } from 'next'
import { getCsrfToken, getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '../components/layout/Layout'
import request from '../core/request'
import showToast from '../core/uiHelpers/showToast'

interface SignInResponse {
	error: string | undefined
	status: number
	ok: boolean
	url: string | null
}

const Login: React.FC = () => {
	const router = useRouter()
	const toast = useToast()

	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')

	const login = () => {
		// TODO: Validate Input Before Attempting Login
		request({
			url: 'https://api.ipify.org/?format=json',
			method: 'GET',
		}).then((ipData) => {
			signIn('credentials', { email, password, ip: ipData.ip, redirect: false }).then((data) => {
				let res = data as unknown as SignInResponse
				if (res?.ok) {
					showToast(toast, 'success', 'Login Successful')
					router.push('/dashboard')
				} else {
					showToast(toast, 'error', 'Login Failed', 'Invalid Credentials')
				}
			})
		})
	}

	return (
		<Layout>
			<div className='w-full'>
				<Center className='h-[37.5rem] w-full'>
					<Box className='w-full md:w-1/2 p-8 rounded-lg shadow-lg' bg='night.400'>
						<h2 className='text-center text-2xl mb-2'>Login</h2>
						<FormControl className='mb-4' isRequired>
							<FormLabel>Email</FormLabel>
							<Input type='email' onChange={(e) => setEmail(e.target.value)} />
						</FormControl>
						<FormControl className='mb-4' isRequired>
							<FormLabel>Password</FormLabel>
							<Input type='password' onChange={(e) => setPassword(e.target.value)} />
						</FormControl>
						<FormControl className='flex flex-col justify-center'>
							<Button
								variant='outline'
								color='frost.100'
								borderColor='frost.100'
								w='100%'
								_hover={{ bg: 'frost.100', color: 'white' }}
								onClick={login}
							>
								Login
							</Button>
							<div className='flex flex-col items-center gap-1 mt-2'>
								<p>
									Forgot Password?
									<Text
										className='inline-block ml-2 cursor-pointer'
										color='frost.100'
										onClick={() => router.push('/forgot-pass')}
									>
										Reset Password
									</Text>
								</p>
								<p>
									<span className='text-snow-100'>Don't Have an Account?</span>
									<Text
										className='inline-block ml-2 cursor-pointer'
										color='frost.100'
										onClick={() => router.push('/register')}
									>
										Register
									</Text>
								</p>
							</div>
						</FormControl>
					</Box>
				</Center>
			</div>
		</Layout>
	)
}

export default Login

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (session && session.user?.id) {
		return {
			redirect: { destination: '/dashboard', permanent: false },
		}
	}

	return {
		props: {
			csrfToken: await getCsrfToken(context),
		},
	}
}
