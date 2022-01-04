import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') prisma = new PrismaClient()
else {
	//@ts-ignore
	if (!global?.prisma) {
		//@ts-ignore
		global.prisma = new PrismaClient()
	}
	//@ts-ignore
	prisma = global?.prisma as PrismaClient
}

export default async function withPrisma<T>(
	cb: (client: PrismaClient) => Promise<T>
): Promise<T> {
	try {
		return await cb(prisma)
	} catch (e) {
		throw e
	} finally {
		await prisma.$disconnect()
	}
}
