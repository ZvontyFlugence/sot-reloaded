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
		bodyParser: false,
	},
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	switch (req.method) {
		case 'POST': {
			const session = await getSession({ req })
			if (!session || !session.user.id) return res.status(403).json({ error: 'Unauthorized' })

			const form = new formidable.IncomingForm()
			return await form.parse(req, async (_err, _fields, files) => {
				let result = await CloudinaryClient.uploader.upload((files.image as formidable.File)?.filepath, {
					folder: 'profile',
				})

				if (result) {
					let updated = await withPrisma(async (client: PrismaClient) => {
						// Get Current User Image
						let current = await client.user.findFirst({
							where: { id: session.user.id },
							select: { image: true },
						})

						// Delete Previous User Image If Not Default Image
						if (current && current.image !== process.env.DEFAULT_USER_IMG) {
							await CloudinaryClient.uploader.destroy(extractPublicId(current.image, CloudinaryFolder.PROFILE))
						}

						// Update User
						return await client.user.update({
							where: { id: session.user.id },
							data: {
								image: result?.secure_url,
							},
						})
					})

					if (updated) res.status(200).json({ success: true })
					else res.status(500).json({ success: false, error: 'PRISMA: Update User Image Failed' })
				} else res.status(400).json({ success: false, error: 'Cloudinary Upload Failed' })
			})
		}
		default:
			return res.status(404).json({ error: 'Unhandled HTTP Method' })
	}
}
