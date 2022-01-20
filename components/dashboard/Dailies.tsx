import request from '../../core/request'
import showToast from '../../core/uiHelpers/showToast'
import { Button } from '@chakra-ui/button'
import { Checkbox } from '@chakra-ui/checkbox'
import { useToast } from '@chakra-ui/toast'
import { useRouter } from 'next/router'
import Card from '../shared/Card'
import { UserActions } from '../../core/enums'
import { useUser } from '../../core/context/UserContext'
import { useColorModeValue } from '@chakra-ui/system'

const Dailies: React.FC = () => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()

	const hasTrained = !!user && new Date(user.canTrain) > new Date(Date.now())
	const hasWorked = !!user && new Date(user.canWork) > new Date(Date.now())
	const hasCollectedRewards = !!user && new Date(user.canCollectRewards) > new Date(Date.now())

	const handleClick = () => {
		if (hasTrained && hasWorked && !hasCollectedRewards) {
			request({
				url: '/api/me/doAction',
				method: 'POST',
				body: { action: UserActions.COLLECT_REWARDS },
			}).then((data) => {
				if (data.success) {
					showToast(toast, 'success', 'Collected Rewards', data?.message)
				} else {
					showToast(toast, 'error', "Couldn't Collect Rewards", data?.error)
				}
			})
		} else {
			router.push('/home')
		}
	}

	return user ? (
		<div className='mt-4'>
			<Card>
				<Card.Header className={`text-xl font-semibold ${useColorModeValue('text-night-300', 'text-snow.100')}`}>
					Daily Tasks
				</Card.Header>
				<Card.Content className={useColorModeValue('text-night-300', 'text-snow.100')}>
					<div className='flex flex-col items-start mt-2 w-full'>
						<Checkbox size='sm' isChecked={hasTrained} isReadOnly>
							Train
						</Checkbox>
						<Checkbox size='sm' isChecked={hasWorked} isReadOnly>
							Work
						</Checkbox>
					</div>
					<div className='flex justify-end'>
						<Button
							bg={hasTrained && hasWorked ? 'frost.300' : 'aurora.green.200'}
							color='snow.100'
							variant='solid'
							colorScheme=''
							isDisabled={hasCollectedRewards}
							onClick={handleClick}
						>
							{hasTrained && hasWorked ? 'Collect Rewards' : 'Go To Task'}
						</Button>
					</div>
				</Card.Content>
			</Card>
		</div>
	) : null
}

export default Dailies
