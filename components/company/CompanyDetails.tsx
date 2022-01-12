import { ITEMS } from '@/core/constants'
import { useUser } from '@/core/context/UserContext'
import { ICompany } from '@/core/interfaces'
import request from '@/core/request'
import showToast from '@/core/uiHelpers/showToast'
import {
	Button,
	FormControl,
	FormLabel,
	Grid,
	GridItem,
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
import { JobOffer, ProductOffer } from '@prisma/client'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import Card from '../shared/Card'

interface CompDetailsProps {
	company: ICompany
	currency: string
}

const CompanyDetails: React.FC<CompDetailsProps> = ({ company, currency }) => {
	const toast = useToast()
	const user = useUser()

	const { mutate } = useSWRConfig()
	const { isOpen, onOpen, onClose } = useDisclosure()

	const [selected, setSelected] = useState<ProductOffer | null>(null)
	const [quantity, setQuantity] = useState<number>(1)

	let canApplyForJob: boolean = (user?.jobId ?? -1) > 0 && user?.id !== company.ceoId

	const applyForJob = (offerId: number) => {
		request({
			url: '/api/market/job/apply',
			method: 'POST',
			body: { offerId },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Application Accepted', data?.message)
			} else {
				showToast(toast, 'error', 'Application Rejected', data?.error)
			}
		})
	}

	const handleOpen = (offer: ProductOffer) => {
		setSelected(offer)
		onOpen()
	}

	const handleClose = () => {
		onClose()
		setSelected(null)
	}

	const handlePurchase = () => {
		request({
			url: '/api/market/goods/purchase',
			method: 'POST',
			body: { offerId: selected?.id, quantity },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Item(s) Purchased', data?.message)
				mutate('/api/me/wallet-info')
			} else {
				showToast(toast, 'error', 'Purchase Failed', data?.error)
			}
		})
	}

	return (
		<div className='w-full'>
			<div className='hidden md:block w-full'>
				<Grid templateColumns='repeat(2, 1fr)' gap={2}>
					<GridItem colSpan={1}>
						<Card>
							<Card.Header className='text-xl font-semibold text-aurora-red'>Product Offers</Card.Header>
							<Card.Content className='text-white'>
								{(company.productOffers?.length ?? 0) === 0 ? (
									<p>Company has no product offers</p>
								) : (
									<Table variant='unstyled' size='sm'>
										<Thead>
											<Tr>
												<Th color='white'>Product</Th>
												<Th color='white'>Amount</Th>
												<Th color='white'>Price</Th>
												<Th color='white'>Action</Th>
											</Tr>
										</Thead>
										<Tbody>
											{company.productOffers?.map((offer, i) => (
												<Tr key={i}>
													<Td>
														<i className={ITEMS[offer.itemId].image} />
														<span className='ml-1'>{ITEMS[offer.itemId].name}</span>
													</Td>
													<Td>{offer.quantity}</Td>
													<Td>
														{Number.parseFloat(offer.price.toString()).toFixed(2)} {offer.currencyCode}
													</Td>
													<Td>
														<Button
															variant='solid'
															size='xs'
															bgColor='frost.400'
															color='snow.100'
															colorScheme=''
															onClick={() => handleOpen(offer)}
														>
															Buy
														</Button>
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								)}
							</Card.Content>
						</Card>
					</GridItem>
					<GridItem colSpan={1}>
						<Card>
							<Card.Header className='text-xl font-semibold text-aurora-red'>Job Offers</Card.Header>
							<Card.Content className='text-white w-max'>
								{(company.jobOffers?.length ?? 0) === 0 ? (
									<p>Company has no job offers</p>
								) : (
									<Table variant='unstyled' size='sm'>
										<Thead>
											<Tr>
												<Th color='white'>Title</Th>
												<Th color='white'>Wage</Th>
												<Th color='white'>Action</Th>
											</Tr>
										</Thead>
										<Tbody>
											{(company.jobOffers?.length ?? 0) > 0 &&
												company.jobOffers?.map((offer, i) => (
													<Tr key={i}>
														<Td>{offer.title}</Td>
														<Td>
															{Number.parseFloat(offer.wage.toString()).toFixed(2)} {currency}
														</Td>
														<Td>
															<Button
																size='xs'
																variant='solid'
																bgColor='aurora.green'
																color='snow.100'
																colorScheme=''
																isDisabled={!canApplyForJob}
																onClick={() => applyForJob(offer.id)}
															>
																Apply
															</Button>
														</Td>
													</Tr>
												))}
										</Tbody>
									</Table>
								)}
							</Card.Content>
						</Card>
					</GridItem>
				</Grid>
			</div>
			<div className='flex md:hidden flex-col justify-center items-center text-sm'>
				<div className='bg-night-400 shadow-md rounded py-2 px-4 text-white w-full'>
					<h3 className='text-xl font-semibold text-aurora-red'>Job Offers</h3>
					{(company.jobOffers?.length ?? 0) > 0 &&
						company.jobOffers?.map((offer: JobOffer, i: number) => (
							<div key={i} className='flex items-center'>
								<div className='flex flex-col flex-grow'>
									<span className='text-base'>{offer.title}</span>
									<span>Positions: {offer.quantity}</span>
								</div>
								<div className='flex-grow'>
									<span>
										{Number.parseFloat(offer.wage.toString()).toFixed(2)} {currency}
									</span>
								</div>
								<div>
									<Button
										size='sm'
										variant='solid'
										bgColor='aurora.green'
										color='white'
										isDisabled={!canApplyForJob}
										onClick={() => applyForJob(offer.id)}
									>
										Apply
									</Button>
								</div>
							</div>
						))}
				</div>
				<div className='bg-night-400 shadow-md rounded py-2 px-4 text-white w-full'>
					<h3 className='text-xl font-semibold text-aurora-red'>Product Offers</h3>
					{(company.productOffers?.length ?? 0) &&
						company.productOffers?.map((offer: ProductOffer, i: number) => (
							<div key={i} className='flex items-center'>
								<div className='flex flex-col flex-grow'>
									<span className='text-base'>
										<i className={ITEMS[offer.itemId].image} />
										{ITEMS[offer.itemId].name}
									</span>
								</div>
								<div className='flex-grow'>
									<span>
										{Number.parseFloat(offer.price.toString()).toFixed(2)} {offer.currencyCode}
									</span>
								</div>
								<div>
									<Button
										variant='solid'
										bgColor='frost.400'
										color='snow.100'
										colorScheme=''
										onClick={() => handleOpen(offer)}
									>
										Buy
									</Button>
								</div>
							</div>
						))}
				</div>
			</div>

			{selected && (
				<Modal isOpen={isOpen} onClose={handleClose}>
					<ModalOverlay />
					<ModalContent bgColor='night.400' color='white'>
						<ModalHeader className='text-aurora-red'>Buy Product</ModalHeader>
						<ModalCloseButton />
						<ModalBody className='flex flex-col gap-2'>
							<p className='mx-auto'>
								Buy {quantity} <i className={ITEMS[selected.itemId].image} title={ITEMS[selected.itemId].name} /> for{' '}
								{(Number.parseInt(selected.price.toString()) * quantity).toFixed(2)} {selected.currencyCode}
							</p>
							<FormControl>
								<FormLabel>Quantity</FormLabel>
								<Input
									type='number'
									value={quantity}
									min={1}
									max={selected.quantity}
									onChange={(e) => setQuantity(e.target.valueAsNumber)}
								/>
							</FormControl>
						</ModalBody>
						<ModalFooter className='flex gap-2'>
							<Button variant='solid' bgColor='aurora.green' color='white' onClick={handlePurchase}>
								Purchase
							</Button>
							<Button variant='outline' _hover={{ bg: 'white', color: 'night.400' }} onClick={handleClose}>
								Cancel
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</div>
	)
}

export default CompanyDetails
