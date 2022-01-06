import Inventory from '@/components/shared/Inventory'
import Select from '@/components/shared/Select'
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
import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface ManageInventoryProps {
	compId: number
	inventory: StorageItem[]
	currency: string
}

interface BasicCountry {
	id: number
	name: string
	flagCode: string
	currency: {
		code: string
	}
}

const countryFetcher = (url: string) => request({ url, method: 'GET' })

const ManageInventory: React.FC<ManageInventoryProps> = ({ compId, currency, inventory }) => {
	const toast = useToast()

	const [selected, setSelected] = useState<StorageItem | null>(null)
	const [quantity, setQuantity] = useState<number>(1)
	const [price, setPrice] = useState<number>(0.01)
	const [country, setCountry] = useState<number>(-1)
	const [countries, setCountries] = useState<BasicCountry[]>([])

	const { data: countryData } = useSWR('/api/countries', countryFetcher)
	const { isOpen, onOpen, onClose } = useDisclosure()

	useEffect(() => {
		if (countryData?.countries) setCountries(countryData.countries as BasicCountry[])
	}, [countryData])

	const createProductOffer = () => {
		const currency = countries.find((c) => c.id === country)?.currency
		if (!currency) return

		request({
			url: '/api/markets/goods/create',
			method: 'POST',
			body: {
				compId,
				countryMarket: country,
				offer: { itemId: selected?.itemId, quantity, price, currency },
			},
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
		setCountry(-1)
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
									<FormLabel>Country</FormLabel>
									<Select
										className='relative border border-white border-opacity-25 rounded shadow-md'
										selected={country}
										onChange={(val) => setCountry(val)}
									>
										{([null] as (BasicCountry | null)[]).concat(countries).map((c: BasicCountry | null, i: number) => (
											<Select.Option key={i} value={c ? c.id : -1} disabled={!c}>
												{c ? (
													<span>
														{c.name} ({c.currency.code}
														<span className='ml-2 sot-flag-wrap'>
															<i className={`sot-flag sot-flag-${c.flagCode} h-7`} />
														</span>
														)
													</span>
												) : (
													'Select Country Market'
												)}
											</Select.Option>
										))}
									</Select>
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
