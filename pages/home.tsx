import { CompanyTypes } from '@/core/constants'
import { IJobRecord } from '@/core/interfaces'
import { Avatar } from '@chakra-ui/avatar'
import { Button } from '@chakra-ui/button'
import { Grid, GridItem, Heading } from '@chakra-ui/layout'
import { useColorModeValue } from '@chakra-ui/system'
import { useToast } from '@chakra-ui/toast'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import Layout from '../components/layout/Layout'
import Card from '../components/shared/Card'
import { useUser } from '../core/context/UserContext'
import { UserActions } from '../core/enums'
import request from '../core/request'
import refreshData from '../core/uiHelpers/refreshData'
import showToast from '../core/uiHelpers/showToast'

const jobFetcher = (url: string) => request({ url, method: 'GET' })

const Home: React.FC = () => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()

	const { mutate } = useSWRConfig()
	const { data: jobData } = useSWR('/api/me/job', jobFetcher)

	const [job, setJob] = useState<IJobRecord | null>(null)

	const hasTrained = !!user && new Date(user.canTrain) > new Date(Date.now())
	const hasWorked = !!user && new Date(user.canWork) > new Date(Date.now())

	useEffect(() => {
		if (jobData?.job.job) setJob(jobData.job.job)
	}, [jobData])

	const handleTrain = () => {
		if (!hasTrained) {
			request({
				url: '/api/me/doAction',
				method: 'POST',
				body: { action: UserActions.TRAIN },
			}).then((data) => {
				if (data.success) {
					showToast(toast, 'success', 'Training Complete', data?.message)
					mutate('/api/me')
					mutate('/api/me/alerts')
					refreshData(router)
				} else {
					showToast(toast, 'error', 'Training Failed', data?.error)
				}
			})
		} else {
			showToast(toast, 'error', 'Already Trained Today', 'You can only train once per day')
		}
	}

	const handleWork = () => {
		if (!hasWorked) {
			request({
				url: '/api/me/doAction',
				method: 'POST',
				body: { action: UserActions.WORK },
			}).then((data) => {
				if (data.success) {
					showToast(toast, 'success', 'Working Complete', data?.message)
					mutate('/api/me')
					mutate('/api/me/wallet-info')
					refreshData(router)
				} else {
					showToast(toast, 'error', 'Working Failed', data?.error)
				}
			})
		} else {
			showToast(toast, 'error', 'You can only work once per day')
		}
	}

	return user ? (
		<Layout>
			<div className='flex flex-col w-full'>
				<Heading color='aurora.red.500' className='text-2xl font-semibold'>
					My Home
				</Heading>
				<div className='hidden md:block w-full'>
					<Grid className='mt-8' w='full' templateColumns='repeat(5, 1fr)' gap={12}>
						<GridItem colSpan={2}>
							<Card>
								<Card.Header
									className={`text-xl font-semibold ${useColorModeValue('text-night-300', 'text-snow-100')}`}
								>
									Gym
								</Card.Header>
								<Card.Content className={useColorModeValue('text-night-300', 'text-snow-100')}>
									<p>
										Current Strength: {user.strength} <i className='sot-icon sot-str' />
									</p>
									<Button
										className='mt-2'
										variant='solid'
										colorScheme=''
										bgColor='frost.300'
										color='snow.100'
										isDisabled={hasTrained}
										onClick={handleTrain}
									>
										Train
									</Button>
								</Card.Content>
							</Card>
						</GridItem>
						<GridItem colStart={3} colEnd={6}>
							<Card>
								<Card.Header
									className={`text-xl font-semibold ${useColorModeValue('text-night-300', 'text-snow-100')}`}
								>
									Work
								</Card.Header>
								<Card.Content className={useColorModeValue('text-night-300', 'text-snow-100')}>
									{job && job.comp ? (
										<div className='flex justify-between items-center mt-2'>
											<div
												className='flex items-center gap-2 cursor-pointer'
												onClick={() => router.push(`/company/${job.id}`)}
											>
												<Avatar src={job.comp.image} name={job.comp.name} />
												{job.comp.name}
												<i className={CompanyTypes[job.comp.type].css} title={CompanyTypes[job.comp.type].text} />
											</div>
											<Button
												variant='solid'
												colorScheme=''
												bgColor='frost.300'
												color='snow.100'
												isDisabled={hasWorked}
												onClick={handleWork}
											>
												Work
											</Button>
										</div>
									) : (
										<div className='flex flex-col justify-center items-center'>
											<p>You do not have a job</p>
											<Button
												className='mt-2'
												variant='solid'
												colorScheme=''
												bgColor='aurora.green.200'
												color='snow.100'
												onClick={() => router.push('/markets/job')}
											>
												Find Job
											</Button>
										</div>
									)}
								</Card.Content>
							</Card>
						</GridItem>
						<GridItem colSpan={5}>
							<Card>
								<Card.Header
									className={`text-xl font-semibold ${useColorModeValue('text-night-300', 'text-snow-100')}`}
								>
									Inventory
								</Card.Header>
								<Card.Content className={useColorModeValue('text-night-300', 'text-snow-100')}>
									<div>Inventory Here</div>
								</Card.Content>
							</Card>
						</GridItem>
					</Grid>
				</div>
				<div className='flex md:hidden flex-col gap-4 mt-2 px-4'>
					<Card>
						<Card.Header className='text-xl font-semibold text-white'>Gym</Card.Header>
						<Card.Content className='text-white'>
							<p>
								Current Strength: {user.strength} <i className='sot-icon sot-str' />
							</p>
							<Button
								className='mt-2'
								variant='solid'
								colorScheme=''
								bgColor='frost.300'
								color='snow.100'
								isDisabled={hasTrained}
								onClick={handleTrain}
							>
								Train
							</Button>
						</Card.Content>
					</Card>
					<Card>
						<Card.Header className='text-xl font-semibold text-white'>Work</Card.Header>
						<Card.Content className='text-white'>
							{job && job.comp ? (
								<div className='flex justify-between items-center mt-2'>
									<div
										className='flex items-center gap-2 cursor-pointer'
										onClick={() => router.push(`/company/${job.id}`)}
									>
										<Avatar src={job.comp.image} name={job.comp.name} />
										{job.comp.name}
										<i className={CompanyTypes[job.comp.type].css} title={CompanyTypes[job.comp.type].text} />
									</div>
									<Button
										variant='solid'
										colorScheme=''
										bgColor='frost.300'
										color='snow.100'
										isDisabled={hasWorked}
										onClick={handleWork}
									>
										Work
									</Button>
								</div>
							) : (
								<div className='flex flex-col justify-center items-center'>
									<p>You do not have a job</p>
									<Button
										className='mt-2'
										variant='solid'
										colorScheme=''
										bgColor='aurora.green.200'
										color='snow.100'
										onClick={() => router.push('/markets/job')}
									>
										Find Job
									</Button>
								</div>
							)}
						</Card.Content>
					</Card>
					<Card>
						<Card.Header className='text-xl font-semibold text-white'>Inventory</Card.Header>
						<Card.Content className='text-white'>
							<div>Inventory Here</div>
						</Card.Content>
					</Card>
				</div>
			</div>
		</Layout>
	) : null
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (!session) {
		return {
			redirect: { destination: '/login', permanent: false },
		}
	}

	return {
		props: {},
	}
}
