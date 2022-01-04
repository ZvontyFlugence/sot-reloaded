import {
	Button,
	IconButton,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	useToast,
} from '@chakra-ui/react'
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from '@chakra-ui/modal'
import { useEffect, useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import { UserActions } from '@/core/enums'
import request from '@/core/request'
import showToast from '@/core/uiHelpers/showToast'
import { useRouter } from 'next/router'
import { IUser } from '@/core/interfaces'
import { InvItem } from '@prisma/client'
import refreshData from '@/core/uiHelpers/refreshData'
import Inventory from '../shared/Inventory'
import useSWR from 'swr'
import { ITEMS } from '@/core/constants'

interface GiftModalProps {
	profile: IUser
	isOpen: boolean
	onClose: () => void
}

const inventoryFetcher = (url: string) => request({ url, method: 'GET' })

const GiftModal: React.FC<GiftModalProps> = ({ profile, isOpen, onClose }) => {
	const router = useRouter()
	const toast = useToast()

	const [inventory, setInventory] = useState<InvItem[]>([])
	const [selected, setSelected] = useState<InvItem[]>([])

	const { data: invData } = useSWR('/api/me/inventory', inventoryFetcher)

	useEffect(() => {
		if (invData?.inventory) setInventory(invData.inventory)
	}, [invData])

	const handleGift = () => {
		request({
			url: '/api/me/doAction',
			method: 'POST',
			body: {
				action: UserActions.GIFT,
				data: { profileId: profile.id, items: selected },
			},
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Gift Sent', data?.message)
				refreshData(router)
				handleClose()
			} else {
				showToast(toast, 'error', 'Gift Items Failed', data?.error)
			}
		})
	}

	const handleSelect = (item: InvItem) => {
		setSelected((prev) => {
			let index = prev.findIndex((itm) => itm.id === item.id)
			if (index === -1) return [...prev, { ...item, quantity: 1 }]

			return prev
		})
	}

	const handleUnselect = (id: number) => {
		setSelected((prev) => {
			let index = prev.findIndex((itm) => itm.id === id)
			if (index > -1) prev.splice(index, 1)
			return [...prev]
		})
	}

	const updateItem = (id: number, value: number) => {
		setSelected((prev) => {
			let index = prev.findIndex((itm) => itm.id === id)
			if (index > -1) {
				let item = prev.splice(index, 1)
				return [...prev, { ...item[0], quantity: value }]
			}

			return prev
		})
	}

	const handleClose = () => {
		setSelected([])
		onClose()
	}

	return (
		<Modal size='2xl' isOpen={isOpen} onClose={handleClose}>
			<ModalOverlay />
			<ModalContent bgColor='night.400' color='snow.100'>
				<ModalHeader className='text-aurora-red font-semibold'>
					Gift Items
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody className='flex flex-col gap-2'>
					<p className='font-semibold'>Your Inventory</p>
					<Inventory
						inventory={inventory}
						setSelected={(item: InvItem) => handleSelect(item)}
					/>
					<p className='font-semibold'>Items to Gift</p>
					{selected.length > 0 ? (
						<div className='flex flex-col gap-2'>
							{selected.map((item) => {
								let max =
									inventory.find((itm) => itm.itemId === item.itemId)
										?.quantity || 0

								return (
									<div key={item.id} className='flex items-center gap-2'>
										<i className={ITEMS[item.itemId].image} />
										{ITEMS[item.itemId].name}
										<div className='px-4 w-full'>
											<Slider
												colorScheme=''
												bgColor='frost.300'
												min={1}
												max={max || 4}
												step={1}
												onChangeEnd={(val) => updateItem(item.id, val)}
											>
												<SliderTrack>
													<SliderFilledTrack />
												</SliderTrack>
												<SliderThumb />
											</Slider>
										</div>
										<span className='pr-2'>{item.quantity}</span>
										<IconButton
											aria-label='Remove Item'
											variant='solid'
											size='sm'
											colorScheme=''
											bgColor='aurora.red'
											color='snow.100'
											icon={<IoCloseSharp />}
											onClick={() => handleUnselect(item.id)}
										/>
									</div>
								)
							})}
						</div>
					) : (
						<p>No items selected</p>
					)}
				</ModalBody>
				<ModalFooter className='flex gap-4'>
					<Button
						variant='solid'
						size='sm'
						colorScheme=''
						bgColor='aurora.green'
						color='snow.100'
						onClick={handleGift}
						disabled={selected.length === 0}
					>
						Gift Items
					</Button>
					<Button
						variant='outline'
						size='sm'
						colorScheme=''
						color='snow.100'
						_hover={{ bg: 'snow.100', color: 'night.400' }}
						onClick={handleClose}
					>
						Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

export default GiftModal
