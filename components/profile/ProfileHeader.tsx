import { useUser } from '@/core/context/UserContext'
import { IUser } from '@/core/interfaces'
import { SettingsIcon } from '@chakra-ui/icons'
import { IconButton, Image, useDisclosure, useToast, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { IoGiftOutline, IoMailOutline } from 'react-icons/io5'
import { AiOutlineDollar, AiOutlineUsergroupAdd, AiOutlineUsergroupDelete } from 'react-icons/ai'
import GiftModal from './GiftModal'
import DonateModal from './DonateModal'
import request from '@/core/request'
import { UserActions } from '@/core/enums'
import showToast from '@/core/uiHelpers/showToast'
import refreshData from '@/core/uiHelpers/refreshData'
import { useEffect, useState } from 'react'
import { Friend, PendingFriend } from '@prisma/client'
import useSWR from 'swr'

interface ProfileHeaderProps {
	profile: IUser
}

const friendsFetcher = (url: string) => request({ url, method: 'GET' })
const pendingFriendsFetcher = (url: string) => request({ url, method: 'GET' })

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()

	const [friends, setFriends] = useState<Friend[]>([])
	const [pendingFriends, setPendingFriends] = useState<PendingFriend[]>([])

	const { data: friendData } = useSWR('/api/me/friends', friendsFetcher)
	const { data: pendingFriendData } = useSWR('/api/me/pendingFriends', pendingFriendsFetcher)

	const { isOpen: isSendMsgOpen, onOpen: onOpenSendMsg, onClose: onCloseSendMsg } = useDisclosure()
	const { isOpen: isDonateOpen, onOpen: onOpenDonate, onClose: onCloseDonate } = useDisclosure()
	const { isOpen: isGiftOpen, onOpen: onOpenGift, onClose: onCloseGift } = useDisclosure()

	useEffect(() => {
		if (friendData?.friends) setFriends(friendData.friends)
	}, [friendData])

	useEffect(() => {
		if (pendingFriendData?.pendingFriends) setPendingFriends(pendingFriendData.pendingFriends)
	}, [pendingFriendData])

	const addFriend = () => {
		const body = {
			action: UserActions.SEND_FR,
			data: { profileId: profile.id },
		}

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body,
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Friend Request Sent', data?.message)
				refreshData(router)
			} else {
				showToast(toast, 'error', 'Friend Request Failed', data?.error)
			}
		})
	}

	const removeFriend = () => {
		const body = {
			action: UserActions.REMOVE_FR,
			data: { profileId: profile.id },
		}

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body,
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Friend Removed', data?.message)
				refreshData(router)
			} else {
				showToast(toast, 'error', 'Remove Friend Failed', data?.error)
			}
		})
	}

	const getProfileActions = () => {
		return user && user.id === profile.id ? (
			<IconButton
				aria-label='Account Settings'
				variant='outline'
				size='sm'
				color='snow.300'
				colorScheme='whiteAlpha'
				title='Account Settings'
				icon={<SettingsIcon />}
				disabled={user.id !== profile.id}
				onClick={() => router.push('/settings')}
			/>
		) : (
			<VStack spacing={2} align='top'>
				{console.log('Friends:', profile.friends)}
				{console.log('Pending', profile.pendingFriends)}
				{profile.friends?.findIndex((fr) => fr.friendId === user?.id) === -1 ? (
					<IconButton
						aria-label='Add Friend'
						variant='outline'
						size='sm'
						color='frost.100'
						colorScheme=''
						title='Add Friend'
						icon={<AiOutlineUsergroupAdd />}
						disabled={(profile.pendingFriends?.findIndex((pf) => pf.pending === user?.id) ?? -1) >= 0}
						onClick={addFriend}
					/>
				) : (
					<IconButton
						aria-label='Remove Friend'
						variant='outline'
						size='sm'
						color='aurora.red'
						colorScheme=''
						title='Remove Friend'
						icon={<AiOutlineUsergroupDelete />}
						onClick={removeFriend}
					/>
				)}
				<IconButton
					aria-label='Send Message'
					variant='outline'
					size='sm'
					color='frost.100'
					colorScheme=''
					title='Send Message'
					icon={<IoMailOutline />}
					onClick={onOpenSendMsg}
				/>
				<IconButton
					aria-label='Donate Money'
					variant='outline'
					size='sm'
					color='frost.100'
					colorScheme=''
					title='Donate Money'
					icon={<AiOutlineDollar />}
					onClick={onOpenDonate}
				/>
				<IconButton
					aria-label='Gift Items'
					variant='outline'
					size='sm'
					color='frost.100'
					colorScheme=''
					title='Gift Items'
					icon={<IoGiftOutline />}
					onClick={onOpenGift}
				/>
			</VStack>
		)
	}

	return user ? (
		<>
			<div className='hidden md:block bg-night-400 text-snow-100 p-4 shadow-md rounded'>
				<div className='flex items-stretch gap-4'>
					<Image boxSize={'10.0rem'} borderRadius='full' src={profile.image} alt={profile.username} />
					<div className='flex flex-col w-full items-top'>
						<h3 className='flex items-center gap-4 text-2xl text-aurora-red font-semibold'>
							{profile.username}
							<span className='sot-flag-wrap'>
								<i className={`sot-flag sot-flag-${profile.country?.flagCode} h-10`} />
							</span>
						</h3>
						<p className='flex flex-row items-center mt-4 gap-6'>
							<span>Level: {profile.level}</span>
							<span>Experience: {profile.xp}</span>
						</p>
						<p className='flex flex-row items-center mt-1'>
							<span>Location:</span>
							<span className='link ml-2' onClick={() => router.push(`/region/${profile.locationId}`)}>
								{profile.location?.name}
							</span>
							,
							<span
								className='flex items-center link ml-2'
								onClick={() => router.push(`/country/${profile.location?.ownerId}`)}
							>
								{profile.location?.owner?.name}
								<span className='ml-2 sot-flag-wrap'>
									<i className={`sot-flag sot-flag-${profile.location?.owner?.flagCode} h-7`} />
								</span>
							</span>
						</p>
						<p className='flex flex-col mt-1'>
							<span>Description:</span>
							<span className='border border-solid border-white border-opacity-25 p-2 w-full rounded-md'>
								<i>{profile.description}</i>
							</span>
						</p>
					</div>
					<div className='flex flex-col justify-self-start self-start'>{getProfileActions()}</div>
				</div>
			</div>
			<div className='flex md:hidden bg-night-400 text-snow-100 p-2.5 gap-4 shadow-md rounded'>
				<div className='flex flex-col flex-grow'>
					<div className='flex items-center gap-2'>
						<Image boxSize='3.0rem' borderRadius='full' src={profile.image} alt={profile.username} />
						<h3 className='flex gap-4 text-lg text-aurora-red font-semibold'>
							{profile.username}
							<span className='sot-flag-wrap'>
								<i className={`sot-flag sot-flag-${profile.country?.flagCode} h-7`} />
							</span>
						</h3>
					</div>
					<div className='flex flex-col text-xs mt-4'>
						<p className='flex items-center gap-6'>
							<span>Level: {profile.level}</span>
							<span>Experience: {profile.xp}</span>
						</p>
						<p className='flex items-center mt-1'>
							<span>Location:</span>
							<span className='link ml-2' onClick={() => router.push(`/region/${profile.locationId}`)}>
								{profile.location?.name}
							</span>
							,
							<span
								className='flex items-center link ml-2'
								onClick={() => router.push(`/country/${profile.location?.ownerId}`)}
							>
								{profile.location?.owner?.name}
								<span className='ml-2 sot-flag-wrap'>
									<i className={`sot-flag sot-flag-${profile.location?.owner?.flagCode} h-6`} />
								</span>
							</span>
						</p>
						<p className='flex flex-col mt-4'>
							<span>Description:</span>
							<span className='border border-solid border-white border-opacity-25 p-2 w-full rounded-md'>
								<i>{profile.description}</i>
							</span>
						</p>
					</div>
				</div>
				<div className='flex flex-col justify-self-start self-start'>{getProfileActions()}</div>
			</div>
			<GiftModal profile={profile} isOpen={isGiftOpen} onClose={onCloseGift} />
			<DonateModal profile={profile} isOpen={isDonateOpen} onClose={onCloseDonate} />
		</>
	) : null
}

export default ProfileHeader
