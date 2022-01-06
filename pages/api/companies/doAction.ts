import type { NextApiRequest, NextApiResponse } from 'next'
import { CompanyActions } from '@/core/enums'
import { getSession } from 'next-auth/react'
import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'

interface ReqBody {
	action: string
	data: { [key: string]: any }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const { action, data } = JSON.parse(req.body) as ReqBody

			switch (action) {
				case CompanyActions.EDIT_EMPLOYEE: {
					let result = await edit_employee(data as EditEmpReqBody)
				}
				case CompanyActions.FIRE_EMPLOYEE: {
					let result = await fire_employee(data as FireEmpReqBody)
				}
				case CompanyActions.REBRAND: {
					let result = await rebrand(data as RebrandReqBody)
					return res.status(result.status).json(result.body)
				}
				case CompanyActions.RELOCATE: {
					let result = await relocate(data as RelocateReqBody)
					return res.status(result.status).json(result.body)
				}
				default:
					return res.status(400).json({ error: 'Unsupported Company Action' })
			}
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}

interface EditEmpReqBody {}

async function edit_employee(data: EditEmpReqBody) {}

interface FireEmpReqBody {}

async function fire_employee(data: FireEmpReqBody) {}

interface RebrandReqBody {
	compId: number
	name: string
}

async function rebrand(data: RebrandReqBody) {
	let updated = await withPrisma(async (client: PrismaClient) => {
		return await client.company.update({
			where: { id: data.compId },
			data: {
				name: data.name,
			},
		})
	})

	if (updated) return { status: 200, body: { success: true } }
	return { status: 500, body: { success: false, error: 'Something Went Wrong' } }
}

interface RelocateReqBody {
	compId: number
	regionId: number
}

async function relocate(data: RelocateReqBody) {
	let updated = await withPrisma(async (client: PrismaClient) => {
		return await client.company.update({
			where: { id: data.compId },
			data: {
				locationId: data.regionId,
			},
		})
	})

	if (updated) return { status: 200, body: { success: true } }
	return { status: 500, body: { success: false, error: 'Something Went Wrong' } }
}
