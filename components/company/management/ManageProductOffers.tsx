import { ITEMS } from '@/core/constants'
import request from '@/core/request'
import refreshData from '@/core/uiHelpers/refreshData'
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
	Table,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
	useToast,
} from '@chakra-ui/react'
import { ProductOffer, StorageItem } from '@prisma/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ManageProductOffersProps {
	companyId: number
	productOffers: ProductOffer[]
	inventory: StorageItem[]
}

const ManageProductOffers: React.FC<ManageProductOffersProps> = ({ companyId, inventory, productOffers }) => {
	const router = useRouter()
	const toast = useToast()

	const [selected, setSelected] = useState<number>(-1)
	const [productId, setProductId] = useState<number>(-1)
	const [quantity, setQuantity] = useState<number>(0)
	const [price, setPrice] = useState<number>(0.01)

	const { isOpen: isEditOpen, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()

	useEffect(() => {
		if (selected >= 0) {
			let offer = productOffers[selected]
			setProductId(offer.itemId)
			setQuantity(offer.quantity)
			setPrice(Number.parseInt(offer.price.toString()))
		} else {
			setProductId(-1)
			setQuantity(0)
			setPrice(0.01)
		}
	}, [selected])

	const editProductOffer = () => {
		const offer = productOffers[selected]
		request({
			url: '/api/market/goods/edit',
			method: 'POST',
			body: {
				offer: {
					id: offer.id,
					itemId: productId,
					quantity,
					price,
					diff: offer.quantity - quantity,
				},
				compId: companyId,
			},
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Product Offer Updated', data?.message)
				refreshData(router)
				handleClose('edit')
			} else {
				showToast(toast, 'error', 'Edit Product Offer Failed', data?.error)
			}
		})
	}

	const deleteProductOffer = () => {
		const id = productOffers[selected]

		request({
			url: '/api/market/goods/delete',
			method: 'DELETE',
			body: { compId: companyId, offerId: id },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Product Offer Delete', data?.message)
				refreshData(router)
				handleClose('delete')
			} else {
				showToast(toast, 'error', 'Delete Product Offer Failed', data?.error)
			}
		})
	}

	const handleOpen = (index: number, modal: string) => {
		setSelected(index)
		switch (modal.toLowerCase()) {
			case 'edit': {
				onOpenEdit()
				return
			}
			case 'delete': {
				onOpenDelete()
				return
			}
			default: {
				setSelected(-1)
				return
			}
		}
	}

	const handleClose = (modal: string) => {
		setSelected(-1)
		switch (modal.toLowerCase()) {
			case 'edit': {
				onCloseEdit()
				return
			}
			case 'delete': {
				onCloseDelete()
				return
			}
			default:
				return
		}
	}

	return (
		<div className='flex flex-col'>
			{!productOffers || productOffers.length === 0 ? (
				<p>Company has no product offers</p>
			) : (
				<>
					<p className='text-xl font-semibold text-center text-aurora-red'>Active Offers</p>
					<div className='hidden md:block'>
						<Table variant='unstyled'>
							<Thead>
								<Tr>
									<Th color='white'>Item</Th>
									<Th color='white'>Quantity</Th>
									<Th color='white'>Price</Th>
									<Th color='white'>Actions</Th>
								</Tr>
							</Thead>
							<Tbody>
								{productOffers.map((offer: ProductOffer, i: number) => (
									<Tr key={i}>
										<Td>
											<i className={ITEMS[offer.itemId].image} /> {ITEMS[offer.itemId].name}
										</Td>
										<Td>{offer.quantity}</Td>
										<Td>
											{Number.parseFloat(offer.price.toString()).toFixed(2)} {offer.currencyCode}
										</Td>
										<Td className='flex gap-4'>
											<Button
												variant='solid'
												bgColor='frost.400'
												color='white'
												colorScheme=''
												onClick={() => handleOpen(i, 'edit')}
											>
												Edit
											</Button>
											<Button
												variant='solid'
												bgColor='aurora.red'
												color='white'
												onClick={() => handleOpen(i, 'delete')}
											>
												Delete
											</Button>
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</div>
					<div className='flex md:hidden flex-col items-center gap-4'>
						{productOffers.map((offer: ProductOffer, i: number) => (
							<div key={i} className='flex items-center w-full'>
								<div className='flex flex-col flex-grow'>
									<span className='text-base'>
										<i className={ITEMS[offer.itemId].image} />
										{ITEMS[offer.itemId].name}
									</span>
									<span>Quantity: {offer.quantity}</span>
								</div>
								<div className='flex-grow'>
									<span>
										{Number.parseFloat(offer.price.toString()).toFixed(2)} {offer.currencyCode}
									</span>
								</div>
								<div className='flex flex-col items-center gap-2'>
									<Button
										size='sm'
										bgColor='frost.400'
										color='snow.100'
										colorScheme=''
										onClick={() => handleOpen(i, 'edit')}
									>
										Edit
									</Button>
									<Button
										size='sm'
										bgColor='aurora.red'
										color='snow.100'
										colorScheme=''
										onClick={() => handleOpen(i, 'delete')}
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				</>
			)}

			{/* Edit Product Offer Modal */}
			<Modal isOpen={isEditOpen} onClose={() => handleClose('edit')}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='white'>
					<ModalHeader className='text-aurora-red'>Edit Product Offer</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						<FormControl>
							<FormLabel>Quantity</FormLabel>
							<Input
								type='number'
								defaultValue={productOffers[selected]?.quantity ?? 0}
								min={0}
								max={
									(inventory.find((si) => si.itemId === productId)?.quantity ?? 0) +
									(productOffers[selected]?.quantity ?? 0)
								}
								onChange={(e) => setQuantity(e.target.valueAsNumber)}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Price Per Unit</FormLabel>
							<Input
								type='number'
								defaultValue={Number.parseInt(productOffers[selected]?.price.toString()).toFixed(2)}
								min={0.01}
								set={0.01}
								onChange={(e) => setPrice(e.target.valueAsNumber)}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='frost.400' color='white' colorScheme='' onClick={editProductOffer}>
							Update
						</Button>
						<Button variant='outline' _hover={{ bg: 'white', color: 'night.400' }} onClick={() => handleClose('edit')}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Delete Product Offer Modal */}
			<Modal isOpen={isDeleteOpen} onClose={() => handleClose('delete')}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='white'>
					<ModalHeader className='text-aurora-red'>Delete Product Offer</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						<p>Are you sure you want to delete this product offer?</p>
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='aurora.red' color='white' colorScheme='' onClick={deleteProductOffer}>
							Delete
						</Button>
						<Button
							variant='outline'
							_hover={{ bg: 'white', color: 'night.400' }}
							onClick={() => handleClose('delete')}
						>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	)
}

export default ManageProductOffers
