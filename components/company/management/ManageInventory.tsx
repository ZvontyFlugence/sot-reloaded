import Inventory from '@/components/shared/Inventory'
import { ITEMS } from '@/core/constants'
import { GenericItem } from '@/core/interfaces'
import request from '@/core/request'
import showToast from '@/core/uiHelpers/showToast'
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
	useToast,
} from '@chakra-ui/react'
import { StorageItem } from '@prisma/client'
import { useState } from 'react'

interface ManageInventoryProps {
	compId: number
	inventory: StorageItem[]
	currency: string
}

const ManageInventory: React.FC<ManageInventoryProps> = ({ compId, currency, inventory }) => {
	const toast = useToast()

	const [selected, setSelected] = useState<StorageItem | null>(null)
	const [quantity, setQuantity] = useState<number>(1)
	const [price, setPrice] = useState<number>(0.01)

	const { isOpen, onOpen, onClose } = useDisclosure()

	const createProductOffer = () => {
		request({
			url: '/api/market/goods/create',
			method: 'POST',
			body: { compId, offer: { itemId: selected?.itemId, quantity, price } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'succes', 'Product Offer Created', data?.message)
				onClose()
			} else {
				showToast(toast, 'error', 'Create Product Offer Failed', data?.error)
			}
		})
	}

	const handleCloseCreate = () => {
		setSelected(null)
		setQuantity(1)
		setPrice(0.01)
		onClose()
	}

	return (
		<>
			<div className='flex justify-end gap-4 mb-2'>
				<Button size='sm' variant='solid' bgColor='aurora.green' color='snow.100' colorScheme=''>
					Deposit
				</Button>
			</div>
			<Inventory
				inventory={inventory}
				onSellItem={onOpen}
				setSelected={(item: GenericItem) => {
					setSelected(item as StorageItem)
				}}
			/>
			<Modal isOpen={isOpen} onClose={handleCloseCreate}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-xl font-semibold text-aurora-red'>Create Product Offer</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						{selected && (
							<>
								<p className='mx-auto'>
									Creating Offer for {quantity}{' '}
									<i className={`cursor-pointer ${ITEMS[selected.itemId].image}`} title={ITEMS[selected.itemId].name} />{' '}
									at {price.toFixed(2)} {currency} per unit?
								</p>
								<FormControl>
									<FormLabel>Quantity</FormLabel>
									<Input
										type='number'
										value={quantity}
										min={1}
										max={Math.max(selected.quantity, 1)}
										onChange={(e) => setQuantity(e.target.valueAsNumber)}
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Price Per Unit</FormLabel>
									<Input
										type='number'
										value={price.toFixed(2)}
										min={0.01}
										step={0.01}
										onChange={(e) => setPrice(e.target.valueAsNumber)}
									/>
								</FormControl>
							</>
						)}
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='frost.400' color='snow.100' onClick={createProductOffer}>
							Create Product Offer
						</Button>
						<Button variant='outline' _hover={{ bg: 'snow.100', color: 'night.400' }} onClick={handleCloseCreate}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}

export default ManageInventory
