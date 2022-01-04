import { Country, PrismaClient, User } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import withPrisma from '../../../core/prismaClient'
import bcrypt from 'bcrypt'

interface IRegisterRequest {
	username: string
	email: string
	password: string
	country: number
	ip: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const data = JSON.parse(req.body) as IRegisterRequest

			// Ensure DB Connection and Create User
			const user: User | null = await withPrisma(async (client) => {
				let [location, currency] = await getStartingInfo(client, data.country)
				let createdUser = await client.user.create({
					data: {
						username: data.username,
						email: data.email,
						password: await bcrypt.hash(data.password, 10),
						image: process.env.DEFAULT_USER_IMG,
						countryId: data.country,
						locationId: location,
						residenceId: location,
						ipAddrs: {
							create: {
								ip: data.ip,
							},
						},
						wallet: {
							create: {
								currencyId: currency,
								amount: 25.0,
							},
						},
					},
				})

				return createdUser || null
			})

			if (user) return res.status(201).json({ success: true })

			return res.status(500).json({ success: false, error: 'Something Went Wrong' })
		}
	}
}

type CountryWithStarterInfo = Country & {
	regions: { id: number }[]
	coreRegions: { id: number }[]
	currency: { id: number } | null
}

/**
 * Gathers Country-specific information needed for new accounts
 * @param client PrismaClient -> instance of Prisma Client
 * @param countryId number -> Id for target Country
 * @returns [locationId: number, currencyId: number] -> Info needed to create related documents
 */
const getStartingInfo = async (client: PrismaClient, countryId: number): Promise<[number, number]> => {
	let country: CountryWithStarterInfo | null = await client.country.findFirst({
		where: {
			id: countryId,
		},
		include: {
			regions: {
				select: {
					id: true,
				},
			},
			coreRegions: {
				select: {
					id: true,
				},
			},
			currency: {
				select: {
					id: true,
				},
			},
		},
	})

	if (!country || !country.currency) {
		return [-1, -1]
	} else if (country.regions.length > 0) {
		// Pick From Owned Regions
		let idx = Math.floor(Math.random() * country.regions.length)
		return [country.regions[idx].id, country.currency.id]
	} else {
		// Pick From Core Regions
		let idx = Math.floor(Math.random() * country.coreRegions.length)
		return [country.coreRegions[idx].id, country.currency.id]
	}
}
