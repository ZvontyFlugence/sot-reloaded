import Layout from '@/components/layout/Layout'
import { getSession } from 'next-auth/react'
import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import { GetServerSideProps, NextPage } from 'next'
import CompanyHeader from '@/components/company/CompanyHeader'
import { ICompany } from '@/core/interfaces'
import { useState } from 'react'
import CompanyDetails from '@/components/company/CompanyDetails'
import CompanyManagement from '@/components/company/CompanyManagement'

interface CompanyProps {
	company: ICompany
	currency: string
}

const Company: NextPage<CompanyProps> = ({ company, currency }) => {
	const [manageMode, setManageMode] = useState<boolean>(false)

	return (
		<Layout>
			<div className='flex flex-col w-full'>
				<div className='px-2'>
					<CompanyHeader company={company} onManage={() => setManageMode((prev) => !prev)} />
					<div className='mt-4'>
						{!manageMode ? (
							<CompanyDetails company={company} currency={currency} />
						) : (
							<CompanyManagement company={company} currency={currency} />
						)}
					</div>
				</div>
			</div>
		</Layout>
	)
}

export default Company

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req, params } = context
	const session = await getSession({ req })
	if (!session || !session.user.id) {
		console.log('No Session Provided From NextAuth')
		return {
			redirect: { destination: '/', permanent: false },
		}
	}

	if (!params || !params?.compId) {
		console.log('No Params Provided From Next.js')
		return {
			redirect: { destination: '/dashboard', permanent: false },
		}
	}

	let [company, currency] = await withPrisma(async (client: PrismaClient) => {
		const company = await client.company.findUnique({
			where: { id: Number.parseInt(params.compId as string) },
			include: {
				ceo: true,
				employees: {
					include: {
						user: {
							select: {
								username: true,
								image: true,
							},
							take: 1, // Should only be 1 user per job record but enforce just in case
						},
					},
				},
				funds: true,
				inventory: true,
				jobOffers: true,
				location: {
					include: {
						owner: true,
					},
				},
				productOffers: true,
			},
		})

		if (!company) {
			console.log('No Company Returned By Prisma')
			return [null, null]
		}

		const currency = await client.currency.findUnique({
			where: {
				countryId: company?.location.ownerId,
			},
			select: {
				code: true,
			},
		})

		return [company, currency]
	})

	if (!company || !currency) {
		console.log('No Currency Returned By Prisma')
		return {
			redirect: { destination: '/dashboard', permanent: false },
		}
	}

	return {
		props: {
			company: JSON.parse(JSON.stringify(company)),
			currency: currency?.code,
		},
	}
}
