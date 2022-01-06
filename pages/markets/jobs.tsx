import Layout from '@/components/layout/Layout'
import Select from '@/components/shared/Select'
import { CompanyTypes } from '@/core/constants'
import { useUser } from '@/core/context/UserContext'
import withPrisma from '@/core/prismaClient'
import request from '@/core/request'
import refreshData from '@/core/uiHelpers/refreshData'
import showToast from '@/core/uiHelpers/showToast'
import { Avatar, Button, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { Country, JobOffer, PrismaClient } from '@prisma/client'
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface JobMarketProps {
	defaultCountryId: number
	countries: Country[]
}

type JobOfferExtended = JobOffer & {
	comp: {
		id: number
		name: string
		image: string
		type: number
		ceoId: number
	}
}

const getCountryJobOffersFetcher = (url: string) => request({ url, method: 'GET' })

const JobMarket: NextPage<JobMarketProps> = ({ countries, defaultCountryId }) => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()

	const [country, setCountry] = useState<number>(defaultCountryId)
	const [jobOffers, setJobOffers] = useState<JobOfferExtended[]>([])

	const { data: jobOfferData } = useSWR(`/api/markets/jobs?country_id=${country}`, getCountryJobOffersFetcher)

	useEffect(() => {
		if (jobOfferData?.jobOffers) setJobOffers(jobOfferData.jobOffers)
	}, [jobOfferData])

	const canApplyForJob = (ceo: number): boolean => {
		return user?.jobId === -1 && user.id !== ceo && user.countryId === country
	}

	const applyForJob = (compId: number, jobId: number) => {
		request({
			url: '/api/markets/jobs/apply',
			method: 'POST',
			body: { compId, jobId },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Job Application Successful', data?.message)
				refreshData(router)
			} else {
				showToast(toast, 'error', 'Job Application Failed', data?.error)
			}
		})
	}

	return user ? (
		<Layout>
			<div className='flex flex-col w-full'>
				<h1 className='flex justify-between'>
					<span className='text-2xl font-semibold text-aurora-red'>Job Market</span>
					<div>
						<Select
							className='relative border border-white border-opacity-25 rounded shadow-md'
							selected={country}
							onChange={(val) => setCountry(val)}
						>
							{countries.map((c: Country, i: number) => (
								<Select.Option key={i} value={c.id}>
									<div className='flex !items-center gap-2'>
										<span>{c.name}</span>
										<span className='sot-flag-wrap'>
											<i className={`sot-flag sot-flag-${c.flagCode} h-8`} />
										</span>
									</div>
								</Select.Option>
							))}
						</Select>
					</div>
				</h1>
				<div className='mt-4 bg-night-400 rounded-md shadow-md'>
					{jobOffers.length === 0 ? (
						<p className='p-4'>Country has no job offers</p>
					) : (
						<Table variant='unstyled' bgColor='night.400' color='snow.100'>
							<Thead>
								<Tr>
									<Th color='snow.100'>Company</Th>
									<Th color='snow.100'>Job Type</Th>
									<Th color='snow.100'>Job Title</Th>
									<Th color='snow.100'>Available Positions</Th>
									<Th color='snow.100'>Wage</Th>
									<Th color='snow.100'>Action</Th>
								</Tr>
							</Thead>
							<Tbody>
								{jobOffers.map((offer: JobOfferExtended, i: number) => (
									<Tr key={i}>
										<Td
											className='flex items-center gap-2 link'
											onClick={() => router.push(`/company/${offer.compId}`)}
										>
											<Avatar src={offer.comp.image} name={offer.comp.name} />
											{offer.comp.name}
										</Td>
										<Td>
											<i className={CompanyTypes[offer.comp.type].css} title={CompanyTypes[offer.comp.type].text} />
										</Td>
										<Td>{offer.title}</Td>
										<Td>{offer.quantity}</Td>
										<Td>{Number.parseFloat(offer.wage.toString()).toFixed(2)}</Td>
										<Td>
											<Button
												size='sm'
												variant='solid'
												bgColor='aurora.green'
												color='snow.100'
												colorScheme=''
												isDisabled={!canApplyForJob(offer.comp.ceoId)}
												onClick={() => applyForJob(offer.compId, offer.id)}
											>
												Apply
											</Button>
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					)}
				</div>
			</div>
		</Layout>
	) : null
}

export default JobMarket

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (!session || !session.user.id)
		return {
			redirect: { destination: '/', permanent: false },
		}

	let [user, countries] = await withPrisma(async (client: PrismaClient) => {
		const user = await client.user.findUnique({
			where: { id: session.user.id },
			select: {
				location: {
					select: {
						ownerId: true,
					},
				},
			},
		})

		const countries = await client.country.findMany({})

		return [user, countries]
	})

	if (!user)
		return {
			redirect: { destination: '/dashboard', permanent: false },
		}

	return {
		props: {
			defaultCountryId: user.location.ownerId,
			countries: JSON.parse(JSON.stringify(countries)),
		},
	}
}
