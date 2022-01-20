import Layout from '@/components/layout/Layout'
import { useUser } from '@/core/context/UserContext'
import request from '@/core/request'
import convertDecimal from '@/core/uiHelpers/convertDecimal'
import showToast from '@/core/uiHelpers/showToast'
import { Button, FormControl, FormLabel, Input, useToast } from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useSWRConfig } from 'swr'

const CreateNewspaper: React.FC = () => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()
	const { mutate } = useSWRConfig()

	const [name, setName] = useState<string>('')

	const hasSufficientFunds: boolean = convertDecimal(user?.gold) >= 5

	const handleCreateNewspaper = () => {
		request({
			url: '/api/newspapers/create',
			method: 'POST',
			body: { name },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Newspaper Created')
				mutate('/api/me')
				router.push(`/newspaper/${data.newsId}`)
			} else {
				showToast(toast, 'error', 'Create Newspaper Failed', data?.error)
			}
		})
	}

	return user ? (
		<Layout>
			<div className='flex flex-col w-full'>
				<h1 className='text-2xl text-aurora-red'>Create Newspaper</h1>
				<div className='flex flex-col items-center justify-center gap-8'>
					<div className='px-4 py-2 rounded shadow-md bg-frost-400 bg-opacity-50'>
						<span className='text-snow-100'>You do not own a newspaper</span>
					</div>
					<div className='flex flex-col items-center gap-2 px-4 py-2 bg-night-400 rounded shadow-md text-snow-100'>
						<FormControl>
							<FormLabel>Newspaper Name</FormLabel>
							<Input type='text' value={name} onChange={(e) => setName(e.target.value)} />
						</FormControl>
						<p>
							Cost: 5.00 <i className='sot-icon sot-coin' />
						</p>
						<Button
							size='sm'
							variant='solid'
							colorScheme=''
							bgColor={hasSufficientFunds ? 'aurora.green' : 'aurora.red'}
							color='snow.100'
							disabled={!hasSufficientFunds}
							onClick={handleCreateNewspaper}
						>
							Create Newspaper
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	) : null
}

export default CreateNewspaper

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { req } = ctx
	const session = await getSession({ req })

	if (!session || !session.user.id)
		return {
			redirect: { destination: '/login', permanent: false },
		}

	// TODO: Redirect to Newspaper Page if User owns a Newspaper

	return { props: {} }
}
