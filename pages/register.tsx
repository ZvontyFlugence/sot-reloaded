import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Box, Center, Text } from '@chakra-ui/layout'
import { GetServerSideProps } from 'next'
import { getCsrfToken, getSession } from 'next-auth/react'
import request from '../core/request'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { Country, PrismaClient } from '.prisma/client'
import withPrisma from '../core/prismaClient'
import Select from '../components/shared/Select'
import showToast from '../core/uiHelpers/showToast'
import { useToast } from '@chakra-ui/toast'

interface RegisterProps {
	countries: Country[]
}

const Register: React.FC<RegisterProps> = ({ countries }) => {
	const router = useRouter()
	const toast = useToast()

	const [email, setEmail] = useState<string>('')
	const [confirm, setConfirm] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [username, setUsername] = useState<string>('')
	const [country, setCountry] = useState<number>(0)

	// TODO: Validate Confirm and Password Always Match

	const register = () => {
		// TODO: Validate input is legal
		request({
			url: 'https://api.ipify.org/?format=json',
			method: 'GET',
		}).then((ipData) => {
			request({
				url: '/api/auth/register',
				method: 'POST',
				body: { country, email, ip: ipData.ip, password, username },
			}).then((data) => {
				if (data?.success) {
					showToast(toast, 'success', 'Account Created', 'You may now login')
					router.push('/login')
				} else {
					showToast(toast, 'error', 'Registration Failed', data?.error)
				}
			})
		})
	}

	return (
		<Layout>
			<Center className='h-[37.5rem] w-full'>
				<Box className='w-full md:w-1/2 p-8 rounded-lg shadow-lg' bg='night.400'>
					<h2 className='text-center text-2xl mb-2'>Register</h2>
					<FormControl className='mb-4' isRequired>
						<FormLabel>Email</FormLabel>
						<Input type='email' onChange={(e) => setEmail(e.target.value)} />
					</FormControl>
					<FormControl className='mb-4' isRequired>
						<FormLabel>Username</FormLabel>
						<Input type='text' onChange={(e) => setUsername(e.target.value)} />
					</FormControl>
					<FormControl className='mb-4' isRequired>
						<FormLabel>Password</FormLabel>
						<Input type='password' onChange={(e) => setPassword(e.target.value)} />
					</FormControl>
					<FormControl className='mb-4' isRequired isInvalid={confirm !== password}>
						<FormLabel>Confirm Password</FormLabel>
						<Input type='password' onChange={(e) => setConfirm(e.target.value)} />
					</FormControl>
					<FormControl className='mb-4' isRequired>
						{/* TODO: Custom Select for Picking Country */}
						<Select
							className='border border-white border-opacity-25 rounded shadow-md'
							selected={country}
							onChange={(val) => setCountry(val)}
						>
							{([null] as any[]).concat(countries).map((c, i) => (
								<Select.Option key={i} value={c != null ? c.id : 0} disabled={!c}>
									{c ? (
										<span className='text-white text-md'>
											{c.name}
											<i className={`ml-2 sot-flag sot-flag-icon-${c.flag_code} shadow-md`} title={c.name} />
										</span>
									) : (
										<span className='text-white text-md'>Select Country</span>
									)}
								</Select.Option>
							))}
						</Select>
					</FormControl>
					<FormControl className='flex flex-col justify-center items-center gap-2'>
						<Button
							variant='outline'
							color='frost.100'
							borderColor='frost.100'
							w='100%'
							_hover={{ bg: 'frost.100', color: 'white' }}
							onClick={register}
						>
							Register
						</Button>
						<p className='mt-2 text-center'>
							Already have an account?
							<Text
								className='inline-block ml-2 cursor-pointer'
								color='frost.100'
								onClick={() => router.push('/login')}
							>
								Login
							</Text>
						</p>
					</FormControl>
				</Box>
			</Center>
		</Layout>
	)
}

export default Register

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (session && session.user?.id) {
		return {
			redirect: { destination: '/dashboard', permanent: false },
		}
	}

	let countries: Country[] = await withPrisma(async (client: PrismaClient) => {
		return await client.country.findMany()
	})

	return {
		props: {
			csrfToken: await getCsrfToken(context),
			countries: JSON.parse(JSON.stringify(countries)),
		},
	}
}
