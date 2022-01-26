import { CompType } from '../enums'

// TODO: Balance Base Productivity Values
export function calculateProductivity(compType: number, bonus: number = 0) {
	let baseProductivity: number

	switch (compType) {
		// RAWS
		case CompType.WHEAT: {
			baseProductivity = 100
			break
		}
		case CompType.IRON: {
			baseProductivity = 75
			break
		}
		case CompType.ALUMINUM: {
			baseProductivity = 50
			break
		}
		case CompType.STEEL: {
			baseProductivity = 50
			break
		}
		case CompType.OIL: {
			baseProductivity = 10
			break
		}
		case CompType.URANIUM: {
			baseProductivity = 1
			break
		}
		// Manufactured (One type for all qualities)
		case CompType.BREAD: {
			baseProductivity = 100
			break
		}
		default: {
			baseProductivity = 0
			break
		}
	}

	return Math.floor(baseProductivity + baseProductivity * (bonus / 100))
}

export function getConsumedMaterials(compType: number, quality: number = 1) {
	let material: number
	let amount: number

	switch (compType) {
		// Manufactured Only (Raws dont consume materials)
		case CompType.BREAD: {
			material = 0
			amount = 100 + (quality - 1) * 20
			break
		}
		default: {
			return [-1, 0]
		}
	}

	return [material, amount]
}
