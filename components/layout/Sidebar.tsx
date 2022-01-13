import { User } from '.prisma/client'
import { Button } from '@chakra-ui/button'
import { Image } from '@chakra-ui/image'
import { Box, HStack, VStack } from '@chakra-ui/layout'
import { Tag } from '@chakra-ui/tag'
import { useRouter } from 'next/router'
import { BellIcon, CalendarIcon, EmailIcon, TimeIcon } from '@chakra-ui/icons'
import neededXP from '../../core/neededXP'
import { Progress } from '@chakra-ui/progress'
import { GiHeartPlus } from 'react-icons/gi'
import { useEffect, useState } from 'react'
import request from '../../core/request'
import { addMinutes, format } from 'date-fns'
import useSWR from 'swr'
import { IAlert, IMail } from '../../core/interfaces'
import { UserActions } from '../../core/enums'
import showToast from '../../core/uiHelpers/showToast'
import { useToast } from '@chakra-ui/toast'

interface SidebarProps {
	user: User
}

interface LocationInfo {
	id: number
	name: string
	owner: {
		id: number
		name: string
		nick: string
		flagCode: string
	}
}

interface WalletInfo {
	amount: string
	currency: {
		code: string
		country: {
			flagCode: string
		}
	}
}

const alertsFetcher = (url: string) => request({ url, method: 'GET' })
const locInfoFetcher = (url: string) => request({ url, method: 'GET' })
const msgThreadFetcher = (url: string) => request({ url, method: 'GET' })
const walletInfoFetcher = (url: string) => request({ url, method: 'GET' })

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
	const router = useRouter()
	const toast = useToast()

	const [alerts, setAlerts] = useState<IAlert[]>([])
	const [locInfo, setLocInfo] = useState<LocationInfo>()
	const [msgThreads, setMsgThreads] = useState<IMail[]>([])
	const [walletInfo, setWalletInfo] = useState<WalletInfo[]>([])

	const { data: alertData } = useSWR('/api/me/alerts', alertsFetcher)
	const { data: locData } = useSWR('/api/me/location-info', locInfoFetcher)
	const { data: msgData } = useSWR('/api/me/mail', msgThreadFetcher)
	const { data: walletData } = useSWR('/api/me/wallet-info', walletInfoFetcher)

	let currentDate = new Date(Date.now())
	let formattedDate = format(addMinutes(currentDate, currentDate.getTimezoneOffset()), 'MM/dd/yy')
	let formattedTime = format(addMinutes(currentDate, currentDate.getTimezoneOffset()), 'HH:mm')
	const hasHealed = !!user && new Date(user.canHeal) > new Date(Date.now())

	useEffect(() => {
		if (alertData?.alerts) setAlerts(alertData.alerts)
	}, [alertData])

	useEffect(() => {
		if (locData?.locationInfo) setLocInfo(locData.locationInfo)
	}, [locData])

	useEffect(() => {
		if (msgData?.messageThreads) setMsgThreads(msgData.messageThreads)
	}, [msgData])

	useEffect(() => {
		if (walletData?.walletInfo) setWalletInfo(walletData.walletInfo)
	}, [walletData])

	const handleHeal = () => {
		if (user.health >= 100 || hasHealed) return

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body: { action: UserActions.HEAL },
		}).then((data) => {
			if (!data.success) {
				showToast(toast, 'error', 'Failed to Heal', data?.error)
			}
		})
	}

	return (
		<VStack className='p-4 rounded-md' bg='night.400' w='15rem'>
			<div
				className='flex flex-col justify-center items-center gap-2 text-sm link w-full'
				onClick={() => router.push(`/profile/${user.id}`)}
			>
				<Image boxSize='5.0rem' rounded='full' src={user.image} />
				<span className='flex items-center gap-2'>
					{user.username}{' '}
					<Tag variant='solid' bg='frost.200' color='white'>
						{user.level}
					</Tag>
				</span>
			</div>
			<HStack className='mt-4' gap={5}>
				<Button
					color={msgThreads.filter((thr) => !thr.read).length > 0 ? 'aurora.red' : 'snow.100'}
					variant='ghost'
					aria-label='View Mail'
					colorScheme=''
					size='sm'
					leftIcon={<EmailIcon />}
					onClick={() => router.push('/mail')}
				>
					{msgThreads.filter((thread) => !thread.read).length}
				</Button>
				<Button
					color={alerts.filter((a) => !a.read).length > 0 ? 'aurora.red' : 'snow.100'}
					variant='ghost'
					aria-label='View Alerts'
					colorScheme=''
					size='sm'
					leftIcon={<BellIcon />}
					onClick={() => router.push('/alerts')}
				>
					{alerts.filter((a) => !a.read).length}
				</Button>
			</HStack>
			<VStack className='my-4 w-full'>
				<div className='w-full text-center'>
					<span className='text-sm'>
						XP: {user.xp} / {neededXP(user.level)}
					</span>
					<Progress
						value={user.xp}
						min={0}
						max={neededXP(user.level)}
						size='sm'
						colorScheme='aurora.orange'
						hasStripe
						isAnimated
					/>
				</div>
				<div className='w-full text-center'>
					<span className='text-sm'>Health: {user.health}%</span>
					<Progress value={user.health} min={0} max={100} size='sm' colorScheme='aurora.green' isAnimated />
				</div>
			</VStack>
			<Button
				variant='solid'
				colorScheme='aurora.green'
				color='white'
				size='sm'
				width='50%'
				leftIcon={<GiHeartPlus />}
				disabled={user.health >= 100 || hasHealed}
				onClick={handleHeal}
			>
				Heal
			</Button>
			<VStack className='mt-8 w-full'>
				{locInfo && (
					<HStack display='flex' justifyContent='space-between' className='text-sm w-full'>
						<span>
							<span className='link' onClick={() => router.push(`/region/${locInfo.id}`)}>
								{locInfo.name}
							</span>
							,
						</span>
						<div className='flex items-center gap-2 link' onClick={() => router.push(`/country/${locInfo.owner.id}`)}>
							<span>{locInfo.owner.nick}</span>
							<span className='sot-flag-wrap'>
								<i className={`sot-flag sot-flag-${locInfo.owner.flagCode} h-7`} />
							</span>
						</div>
					</HStack>
				)}
			</VStack>
			<VStack className='mt-8 w-full'>
				<HStack display='flex' justifyContent='space-between' className='text-sm w-full'>
					<span>Gold</span>
					<div className='flex items-center'>
						<span className='mr-2'>{Number.parseInt(user.gold.toString()).toFixed(2)}</span>
						<i className='sot-icon sot-coin' />
					</div>
				</HStack>
				{walletInfo.length > 0 &&
					walletInfo
						.filter((wi) => wi.currency.country.flagCode === locInfo?.owner.flagCode)
						.map((wi) => (
							<HStack key={wi.currency.code} display='flex' justifyContent='space-between' className='text-sm w-full'>
								<span>{wi.currency.code}</span>
								<div className='flex items-center'>
									<span>{Number.parseFloat(wi.amount).toFixed(2)}</span>
									<span className='ml-2 sot-flag-wrap'>
										<i className={`sot-flag sot-flag-${wi.currency.country.flagCode} h-7`} />
									</span>
								</div>
							</HStack>
						))}
			</VStack>
			<HStack className='text-sm w-full' display='flex' justifyContent='space-between' alignItems='center'>
				<Box display='flex' alignItems='center'>
					<CalendarIcon />
					<span className='ml-2'>{formattedDate}</span>
				</Box>
				<Box display='flex' alignItems='center'>
					<TimeIcon />
					<span className='ml-2'>{formattedTime}</span>
				</Box>
			</HStack>
		</VStack>
	)
}

export default Sidebar
