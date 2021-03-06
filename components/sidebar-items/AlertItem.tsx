import request from '../../core/request'
import showToast from '../../core/uiHelpers/showToast'
import { useToast } from '@chakra-ui/toast'
import { formatDistance } from 'date-fns'
import { Menu, Item, useContextMenu } from 'react-contexify'
import { IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5'
import { Alert } from '.prisma/client'
import { AlertTypes, UserActions } from '../../core/enums'
import { IconButton } from '@chakra-ui/button'
import { MouseEvent } from 'react'

interface AlertItemProps {
	alert: Alert
	mutate: (alertId?: number, remove?: boolean) => void
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, mutate }) => {
	const toast = useToast()

	const { show } = useContextMenu({ id: `alert-${alert.id}` })

	const getTimestamp = () => (
		<span>{formatDistance(new Date(alert.timestamp), new Date(Date.now()), { addSuffix: true })}</span>
	)

	const getActions = () => {
		switch (alert.type) {
			case AlertTypes.SEND_FR: {
				return (
					<div className='flex flex-1 w-full'>
						<div className='flex justify-end gap-2 w-full'>
							<IconButton
								as={IoCheckmarkOutline}
								size='xs'
								variant='solid'
								colorScheme=''
								bgColor='aurora.green'
								color='snow.100'
								onClick={acceptFR}
								aria-label='Accept Friend Request Button'
							/>
							<IconButton
								as={IoCloseOutline}
								size='xs'
								variant='solid'
								colorScheme=''
								bgColor='aurora.red'
								color='snow.100'
								onClick={declineFR}
								aria-label='Decline Friend Request Button'
							/>
						</div>
					</div>
				)
			}
			default:
				return <></>
		}
	}

	const acceptFR = () => {
		mutate(alert.id, true)

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body: { action: UserActions.ACCEPT_FR, data: { alertId: alert.id } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Friend Request Accepted', data?.message)
				mutate()
			} else {
				showToast(toast, 'error', 'Request Not Sent', data?.error)
			}
		})
	}

	// TODO: Implement
	const declineFR = () => {
		mutate(alert.id, true)

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body: { action: UserActions.DECLINE_FR, data: { alertId: alert.id } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Declined Friend Request', data?.message)
				mutate()
			} else {
				showToast(toast, 'error', 'Decline Friend Request Failed', data?.error)
			}
		})
	}

	const readAlert = () => {
		mutate(alert.id)

		request({
			url: '/api/alerts/read',
			method: 'POST',
			body: { alertId: alert.id },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Alert Marked as Read', data?.message)
				mutate()
			} else {
				showToast(toast, 'error', 'Error Reading Alert', data?.error)
			}
		})
	}

	const deleteAlert = () => {
		mutate(alert.id, true)

		request({
			url: '/api/alerts/delete',
			method: 'DELETE',
			body: { alertId: alert.id },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Alert Deleted', data?.message)
				mutate()
			} else {
				showToast(toast, 'error', 'Error Deleting Alert', data?.error)
			}
		})
	}

	const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		show(event)
	}

	return (
		<div className='w-full text-sm'>
			<div
				className={`flex items-center w-full alert-item border-solid border-black border-opacity-25 px-4 py-2 ${
					alert.read ? 'bg-night-200 bg-opacity-25' : 'bg-night-400'
				}`}
				onContextMenu={handleContextMenu}
			>
				<div
					className={`flex justify-start gap-4 py-1 cursor-pointer w-full flex-grow ${
						alert.read ? 'text-snow-100' : 'text-frost-100'
					}`}
				>
					<div>{getTimestamp()}</div>
					<div style={{ fontWeight: alert.read ? 'lighter' : 'bold' }}>{alert.message}</div>
				</div>
				{!alert.read && getActions()}
			</div>

			<Menu id={`alert-${alert.id}`} theme='brand'>
				<Item onClick={readAlert} disabled={alert.read}>
					Mark as Read
				</Item>
				<Item onClick={deleteAlert}>Delete</Item>
			</Menu>
		</div>
	)
}

export default AlertItem
