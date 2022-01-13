import { IMail } from '@/core/interfaces'
import refreshData from '@/core/uiHelpers/refreshData'
import showToast from '@/core/uiHelpers/showToast'
import { Avatar } from '@chakra-ui/avatar'
import { Tag, TagLabel } from '@chakra-ui/tag'
import { useToast } from '@chakra-ui/toast'
import formatDistance from 'date-fns/formatDistance'
import { useRouter } from 'next/router'
import { MouseEvent } from 'react'
import { Item, Menu, useContextMenu } from 'react-contexify'
import { useSWRConfig } from 'swr'
import { useUser } from '../../core/context/UserContext'
import request from '../../core/request'

interface MailItemProps {
	mail: IMail
}

const MailItem: React.FC<MailItemProps> = ({ mail }) => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()
	const { mutate } = useSWRConfig()

	const { show } = useContextMenu({ id: `thread-${mail.threadId}` })

	const getTimestamp = () =>
		mail.thread ? (
			<span>{formatDistance(new Date(mail.thread?.timestamp), new Date(Date.now()), { addSuffix: true })}</span>
		) : (
			<></>
		)

	const goToThread = () => {
		router.push(`/mail/thread/${mail.threadId}`)
	}

	const handleRead = () => {
		request({
			url: '/api/mail/read',
			method: 'POST',
			body: { threadId: mail.threadId },
		}).then((data) => {
			if (data.success) {
				mutate('/api/me/mail')
				refreshData(router)
			} else {
				showToast(toast, 'error', 'Read Message Failed', data?.error)
			}
		})
	}

	const handleDelete = () => {
		request({
			url: '/api/mail/delete',
			method: 'DELETE',
			body: { threadId: mail.threadId },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Message Deleted', data?.message)
				mutate('/api/me/mail')
				refreshData(router)
			} else {
				showToast(toast, 'error', 'Delete Message Failed', data?.error)
			}
		})
	}

	const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
		event.preventDefault()
		show(event)
	}

	return (
		<>
			<div
				className={`flex py-2 px-4 alert-item border-solid border-black border-opacity-25 ${
					mail.read ? 'bg-night-200 bg-opacity-25' : ''
				}`}
				onContextMenu={handleContextMenu}
			>
				<div
					className={`flex justify-between items-center gap-4 py-1 cursor-pointer w-full text-snow-100 ${
						mail.read ? '' : 'font-semibold'
					}`}
					onClick={goToThread}
				>
					<div className='px-2'>
						<Tag
							className='flex-grow-0'
							size='sm'
							variant={mail.read ? 'outline' : 'solid'}
							borderRadius='full'
							bgColor={mail.read ? undefined : 'frost.100'}
						/>
					</div>
					<div className='flex flex-col flex-grow gap-0.5'>
						<span className='flex justify-between font-semibold text-frost-100'>
							{mail.thread?.subject}
							<div className={`px-1 text-snow-100 ${mail.read ? 'font-normal' : 'font-semibold'}`}>
								{getTimestamp()}
							</div>
						</span>
						{mail.thread?.participants
							.filter((u) => u.id !== user?.id)
							.map((user) => (
								<Tag
									className='py-1'
									key={user.id}
									size='md'
									color='snow.100'
									colorScheme='whiteAlpha'
									borderRadius='full'
									w='fit-content'
								>
									<Avatar size='xs' src={user.image} name={user.username} ml={-1} mr={2} />
									<TagLabel>{user.username}</TagLabel>
								</Tag>
							))}
						<div
							className='overflow-hidden overflow-ellipsis whitespace-nowrap'
							style={{ fontWeight: mail.read ? 'lighter' : 'semibold' }}
						>
							{mail.thread?.messages[mail.thread.messages.length - 1].content}
						</div>
					</div>
				</div>
			</div>

			<Menu id={`thread-${mail.threadId}`} theme='brand'>
				<Item onClick={handleRead} disabled={mail.read}>
					Mark as Read
				</Item>
				<Item onClick={handleDelete}>Delete</Item>
			</Menu>
		</>
	)
}

export default MailItem
