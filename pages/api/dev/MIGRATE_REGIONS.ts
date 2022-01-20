import { Region, PrismaClient } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import withPrisma from '../../../core/prismaClient'

interface MongoRegion {
	_id: number
	name: string
	core: number
	owner: number
	resource: number
	borders: MongoRegionPath[] | MongoRegionPath[][]
	neighbors: number[]
	type: string
	representatives: number[]
}

interface MongoRegionPath {
	lat: number
	lng: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const regions = JSON.parse(JSON.stringify(req.body)) as MongoRegion[]

			await withPrisma(async (client: PrismaClient) => {
				let created: (Region | null)[] = []
				created = await Promise.all(
					regions.map(async (r: MongoRegion): Promise<Region | null> => {
						let createdRegion: Region = await client.region.create({
							data: {
								name: r.name,
								resource: r.resource,
								core: {
									connect: {
										id: r.core,
									},
								},
								owner: {
									connect: {
										id: r.owner,
									},
								},
								neighbors: {
									create: [
										...r.neighbors.map((regionId: number) => ({
											neighborId: regionId,
										})),
									],
								},
							},
						})

						if (createdRegion) {
							if (r.type === 'multi') {
								;(r.borders as MongoRegionPath[][]).map(async (geom) => {
									await client.regionGeom.create({
										data: {
											regionId: createdRegion.id,
											geom: {
												create: [...geom.map((path) => ({ lat: path.lat, lng: path.lng }))],
											},
										},
									})
								})
							} else {
								let createdGeom = await client.regionGeom.create({
									data: {
										regionId: createdRegion.id,
									},
								})

								await client.regionPath.createMany({
									data: [
										...(r.borders as MongoRegionPath[]).map((path) => ({
											geomId: createdGeom.id,
											lat: path.lat,
											lng: path.lng,
										})),
									],
								})
							}

							return createdRegion
						}

						return null
					})
				)

				if (created && created.length > 0) {
					return res.status(201).json({ success: true, created: created.filter((val) => val != null) as Region[] })
				}

				return res.status(500).json({ success: false, error: 'Something Went Wrong' })
			})
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
