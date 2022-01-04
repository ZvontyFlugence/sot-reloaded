import { Prisma } from '@prisma/client';

export default function convertDecimal(val?: Prisma.Decimal): number {
	return val ? Number.parseFloat(val.toString()) : 0;
}
