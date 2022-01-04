export default function neededXP(level: number): number {
	return Math.round(0.08 * level ** 3 + 0.8 * level ** 2 + 2 * level)
}
