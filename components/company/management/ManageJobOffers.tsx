import request from '@/core/request'
import refreshData from '@/core/uiHelpers/refreshData'
import showToast from '@/core/uiHelpers/showToast'
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputLeftAddon,
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
import { JobOffer } from '@prisma/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ManageJobOffersProps {
	companyId: number
	jobOffers: JobOffer[]
	currency: string
}

const ManageJobOffers: React.FC<ManageJobOffersProps> = ({ companyId, jobOffers, currency }) => {
	const router = useRouter()
	const toast = useToast()

	const [selected, setSelected] = useState<number>(-1)
	const [title, setTitle] = useState<string>('')
	const [quantity, setQuantity] = useState<number>(1)
	const [wage, setWage] = useState<number>(1.0)

	const { isOpen: isCreateOpen, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()
	const { isOpen: isEditOpen, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()

	useEffect(() => {
		if (selected >= 0) {
			const offer = jobOffers[selected]
			setTitle(offer.title)
			setQuantity(offer.quantity)
			setWage(Number.parseInt(offer.wage.toString()))
		}
	}, [selected])

	const createJobOffer = () => {
		request({
			url: '/api/markets/jobs/create',
			method: 'POST',
			body: { compId: companyId, offer: { title, quantity, wage } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Job Offer Created', data?.message)
				refreshData(router)
				onCloseCreate()
			} else {
				showToast(toast, 'error', 'Create Job Offer Failed', data?.error)
			}
		})
	}

	const editJobOffer = () => {
		const id = jobOffers[selected].id

		request({
			url: '/api/markets/jobs/edit',
			method: 'POST',
			body: { compId: companyId, offer: { id, title, quantity, wage } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Job Offer Edited', data?.message)
				refreshData(router)
				handleClose('edit')
			} else {
				showToast(toast, 'error', 'Edit Job Offer Failed', data?.error)
			}
		})
	}

	const deleteJobOffer = () => {
		const id = jobOffers[selected].id

		request({
			url: '/api/markets/jobs/delete',
			method: 'DELETE',
			body: { compId: companyId, offerId: id },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Job Offer Deleted', data?.message)
				refreshData(router)
				handleClose('delete')
			} else {
				showToast(toast, 'error', 'Delete Job Offer Failed', data?.error)
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
			<div className='hidden md:flex justify-end'>
				<Button variant='solid' bgColor='aurora.green' color='snow.100' colorScheme='' onClick={onOpenCreate}>
					Create Job Offer
				</Button>
			</div>
			<div className='flex md:hidden justify-end mb-2'>
				<Button size='sm' bgColor='aurora.green' color='snow.100' colorScheme='' onClick={onOpenCreate}>
					Create Job Offer
				</Button>
			</div>
			{jobOffers.length === 0 ? (
				<p>Company has no job offers</p>
			) : (
				<>
					<p className='text-xl font-semibold text-center mb-2 md:mb-4 text-aurora-red'>Active Offers</p>
					<div className='hidden md:block w-full'>
						<Table variant='unstyled'>
							<Thead>
								<Tr>
									<Th color='white'>Position Title</Th>
									<Th color='white'>Positions</Th>
									<Th color='white'>Wage</Th>
									<Th color='white'>Actions</Th>
								</Tr>
							</Thead>
							<Tbody>
								{jobOffers.map((offer: JobOffer, i: number) => (
									<Tr key={i}>
										<Td>{offer.title}</Td>
										<Td>{offer.quantity}</Td>
										<Td>{Number.parseInt(offer.wage.toString()).toFixed(2)}</Td>
										<Td>
											<div className='flex gap-4'>
												<Button
													variant='solid'
													size='sm'
													bgColor='frost.400'
													color='snow.100'
													colorScheme=''
													onClick={() => handleOpen(i, 'edit')}
												>
													Edit
												</Button>
												<Button
													variant='solid'
													size='sm'
													bgColor='aurora.red'
													color='snow.100'
													colorScheme=''
													onClick={() => handleOpen(i, 'delete')}
												>
													Delete
												</Button>
											</div>
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</div>
					<div className='flex md:hidden flex-col items-center gap-4'>
						{jobOffers.map((offer: JobOffer, i: number) => (
							<div key={i} className='flex items-center w-full'>
								<div className='flex flex-col flex-grow'>
									<span className='text-base'>{offer.title}</span>
									<span>Quantity: {offer.quantity}</span>
								</div>
								<div className='flex-grow'>
									<span>{Number.parseInt(offer.wage.toString()).toFixed(2)} USD</span>
								</div>
								<div className='flex flex-col justify-center items-center gap-2'>
									<Button size='sm' bgColor='frost.400' color='snow.100' onClick={() => handleOpen(i, 'edit')}>
										Edit
									</Button>
									<Button size='sm' bgColor='aurora.red' color='snow.100' onClick={() => handleOpen(i, 'delete')}>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				</>
			)}

			{/* Create Job Offer Modal */}
			<Modal isOpen={isCreateOpen} onClose={onCloseCreate}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-aurora-red'>Create Job Offer</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						<FormControl>
							<FormLabel>Job Title</FormLabel>
							<Input type='text' onChange={(e) => setTitle(e.target.value)} />
						</FormControl>
						<FormControl>
							<FormLabel>Available Positions</FormLabel>
							<Input type='number' min={1} onChange={(e) => setQuantity(e.target.valueAsNumber)} />
						</FormControl>
						<FormControl>
							<FormLabel>Position Wage</FormLabel>
							<InputGroup>
								<InputLeftAddon bgColor='frost.100' children={currency} />
								<Input
									type='number'
									value={wage.toFixed(2)}
									min={1.0}
									step={0.01}
									onChange={(e) => setWage(e.target.valueAsNumber)}
								/>
							</InputGroup>
						</FormControl>
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='aurora.green' color='snow.100' colorScheme='' onClick={createJobOffer}>
							Create
						</Button>
						<Button variant='outline' _hover={{ bg: 'snow.100', color: 'night.400' }} onClick={onCloseCreate}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Edit Job Offer Modal */}
			{selected >= 0 && jobOffers.length > 0 && (
				<Modal isOpen={isEditOpen} onClose={() => handleClose('edit')}>
					<ModalOverlay />
					<ModalContent bgColor='night' color='white'>
						<ModalHeader className='h-brand text-accent'>Edit Job Offer</ModalHeader>
						<ModalCloseButton />
						<ModalBody className='flex flex-col gap-2'>
							<FormControl>
								<FormLabel>Job Title</FormLabel>
								<Input type='text' value={title} onChange={(e) => setTitle(e.target.value)} />
							</FormControl>
							<FormControl>
								<FormLabel>Available Positions</FormLabel>
								<Input type='number' min={1} value={quantity} onChange={(e) => setQuantity(e.target.valueAsNumber)} />
							</FormControl>
							<FormControl>
								<FormLabel>Position Wage</FormLabel>
								<InputGroup>
									<InputLeftAddon bgColor='accent-alt' children={currency} />
									<Input
										type='number'
										value={wage.toFixed(2)}
										min={1.0}
										step={0.01}
										onChange={(e) => setWage(e.target.valueAsNumber)}
									/>
								</InputGroup>
							</FormControl>
						</ModalBody>
						<ModalFooter className='flex gap-4'>
							<Button variant='solid' colorScheme='blue' onClick={editJobOffer}>
								Update
							</Button>
							<Button variant='outline' _hover={{ bg: 'white', color: 'night' }} onClick={() => handleClose('edit')}>
								Cancel
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}

			{/* Delete Job Offer Modal */}
			<Modal isOpen={isDeleteOpen} onClose={() => handleClose('delete')}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-aurora-red'>Delete Job Offer</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<p>Are you sure you want to delete this job offer?</p>
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='aurora.red' color='snow.100' colorScheme='' onClick={deleteJobOffer}>
							Delete
						</Button>
						<Button
							variant='outline'
							_hover={{ bg: 'snow.100', color: 'night.400' }}
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

export default ManageJobOffers
