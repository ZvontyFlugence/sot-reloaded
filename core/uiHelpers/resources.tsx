import { RESOURCES } from '../constants'

export const getResource = (value: number) => {
	let resourceId = Math.floor((value - 1) / 3)
	let resource = RESOURCES[resourceId]
	let quality = ''

	switch ((value - 1) % 3) {
		case 0:
			quality = 'Low'
			break
		case 1:
			quality = 'Medium'
			break
		case 2:
			quality = 'High'
			break
		default:
			break
	}

	if (value > 0 && resource.css) {
		return (
			<span className='flex justify-end'>
				<span className='mr-2'>
					{quality} {resource.name}
				</span>
				<i className={`align-middle ${resource.css}`} title={resource.name} />
			</span>
		)
	} else {
		return <span className='flex justify-end'>None</span>
	}
}

export const getResourceColor = (resource: number): string => {
	console.log('Resource', resource)
	switch (resource) {
		case 1:
		case 2:
		case 3:
			return '#ffd500' // Wheat
		case 4:
		case 5:
		case 6:
			return '#d6d6d6' // Iron
		case 7:
		case 8:
		case 9:
			return '#4d4c4c' // Oil
		case 10:
		case 11:
		case 12:
			return '#bbeb1e' // Uranium
		case 13:
		case 14:
		case 15:
			return '#a2bfdb' // Aluminum
		case 16:
		case 17:
		case 18:
			return '#81888f' // Steel
		default:
			return '#ffffff' // None
	}
}
