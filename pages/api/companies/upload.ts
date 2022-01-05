import { extractPublicId } from '@/core/apiHelpers/cloudinaryHelpers'
import CloudinaryClient from '@/core/cloudinary'
import { CloudinaryFolder } from '@/core/enums'
import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export const config = {
	api: {
		bodyParser: false
	}
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const form = new formidable.IncomingForm()
			return await form.parse(req, async (_err, fields, files) => {
				let result = await CloudinaryClient.uploader.upload((files.image as formidable.File).filepath, {
					folder: 'company'
				})

				if (result) {
					let updated = await withPrisma(async (client: PrismaClient) => {
						const compId: number = Number.parseInt(fields['compId'] as string)
						console.log('Fields', fields)
						// Get Current Company Logo
						let current = await client.company.findFirst({
							where: { id: compId },
							select: { image: true }
						})

						// Delete Previous Company Logo If Not Default Image
						if (current && current.image !== process.env.DEFAULT_IMG) {
							await CloudinaryClient.uploader.destroy(
								extractPublicId(current.image, CloudinaryFolder.COMPANY)
							)
						}

						// Update Company
						return await client.company.update({
							where: { id: compId },
							data: {
								image: result?.secure_url
							}
						})
					})

					if (updated) res.status(200).json({ success: true })
					else res.status(500).json({ success: false, error: 'Something Went Wrong' })
				} else res.status(400).json({ success: false, error: 'Something Went Wrong' })
			})
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
