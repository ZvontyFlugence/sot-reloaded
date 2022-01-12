import { CompType } from '../enums'

// TODO: Balance Base Productivity Values
export function calculateProductivity(compType: number, bonus: number = 0) {
	let baseProductivity: number

	switch (compType) {
		case CompType.WHEAT: {
			baseProductivity = 75
			break
		}
		case CompType.IRON:
		case CompType.ALUMINUM: {
			baseProductivity = 50
			break
		}
		case CompType.STEEL: {
			baseProductivity = 25
			break
		}
		case CompType.OIL: {
			baseProductivity = 10
			break
		}
		case CompType.URANIUM: {
			baseProductivity = 0.5
			break
		}
		default: {
			baseProductivity = 0
			break
		}
	}

	return Math.floor(baseProductivity + baseProductivity * (bonus / 100))
}
