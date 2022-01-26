import Inventory from '@/components/shared/Inventory'
import Select from '@/components/shared/Select'
import { ITEMS } from '@/core/constants'
import { GenericItem } from '@/core/interfaces'
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
	useDisclosure,
	useToast,
} from '@chakra-ui/react'
import { InvItem, StorageItem } from '@prisma/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'

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
const userInvFetcher = (url: string) => request({ url, method: 'GET' })

const ManageInventory: React.FC<ManageInventoryProps> = ({ compId, currency, inventory }) => {
	const router = useRouter()
	const toast = useToast()

	const [selected, setSelected] = useState<StorageItem | null>(null)
	const [quantity, setQuantity] = useState<number>(1)
	const [price, setPrice] = useState<number>(0.01)
	const [country, setCountry] = useState<number>(-1)
	const [countries, setCountries] = useState<BasicCountry[]>([])
	const [userInv, setUserInv] = useState<InvItem[]>([])
	const [depositItem, setDepositItem] = useState<InvItem | null>(null)

	const { data: countryData } = useSWR('/api/countries', countryFetcher)
	const { data: userInvData } = useSWR('/api/me/inventory', userInvFetcher)

	const { isOpen, onOpen, onClose } = useDisclosure()
	const { isOpen: isDepositOpen, onOpen: onOpenDeposit, onClose: onCloseDeposit } = useDisclosure()

	useEffect(() => {
		if (countryData?.countries) setCountries(countryData.countries as BasicCountry[])
	}, [countryData])

	useEffect(() => {
		// Decrement all item id's by 1 to compensate for prisma auto indices starting at 1 not 0
		if (userInvData?.inventory)
			setUserInv((userInvData.inventory as InvItem[]).map((i) => ({ ...i, itemId: i.itemId - 1 })))
	}, [userInvData])

	const createProductOffer = () => {
		const currency = countries.find((c) => c.id === country)?.currency.code
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
				showToast(toast, 'success', 'Product Offer Created', data?.message)
				refreshData(router)
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

	const selectDepositItem = (id: number) => {
		setDepositItem(userInv.find((i) => i.id === id) ?? null)
	}

	const depositItems = () => {
		request({
			url: '/api/companies/storage/deposit',
			method: 'POST',
			body: { inventoryId: depositItem?.id, itemId: depositItem?.itemId, compId, quantity },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Item Deposited', data?.message)
				mutate('/api/me/inventory')
				refreshData(router)
				handleCloseDeposit()
			} else {
				showToast(toast, 'error', 'Deposit Item Failed', data?.error)
			}
		})
	}

	const handleCloseDeposit = () => {
		setDepositItem(null)
		setQuantity(1)
		onCloseDeposit()
	}

	return (
		<>
			<div className='flex justify-end gap-4 mb-2'>
				<Button
					size='sm'
					variant='solid'
					bgColor='aurora.green'
					color='snow.100'
					colorScheme=''
					onClick={onOpenDeposit}
				>
					Deposit
				</Button>
			</div>
			<Inventory
				inventory={inventory.map((i) => ({ ...i, itemId: i.itemId - 1 }))}
				displayOnly={false}
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
									at {price.toFixed(2)} {countries.find((c) => c.id === country)?.currency.code ?? currency} per unit?
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

			<Modal isOpen={isDepositOpen} onClose={handleCloseDeposit}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-xl font-semibold text-aurora-red'>Deposit Item</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						<FormControl>
							<FormLabel>Item to Deposit</FormLabel>
							<Select
								className='relative border border-snow-100 border-opacity-25'
								selected={depositItem?.id ?? -1}
								onChange={(id) => selectDepositItem(id)}
							>
								{([null] as (InvItem | null)[]).concat(userInv).map((item, i) => (
									<Select.Option key={i} value={item ? item.id : -1} disabled={!item}>
										{item ? (
											<span>
												<i
													className={ITEMS[item.itemId].image}
													title={
														ITEMS[item.itemId].quality >= 1
															? `Q${ITEMS[item.itemId].quality} ${ITEMS[item.itemId].name}`
															: ITEMS[item.itemId].name
													}
												/>
												<span className='ml-2'>{ITEMS[item.itemId].name}</span>
											</span>
										) : (
											<span>Select Item</span>
										)}
									</Select.Option>
								))}
							</Select>
						</FormControl>
						{depositItem && (
							<FormControl>
								<FormLabel>Deposit Amount</FormLabel>
								<Input
									type='number'
									min={1}
									max={depositItem.quantity}
									value={quantity}
									onChange={(e) => setQuantity(e.target.valueAsNumber)}
								/>
							</FormControl>
						)}
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='frost.400' color='snow.100' onClick={depositItems} disabled={!depositItem}>
							Deposit Item
						</Button>
						<Button variant='outline' _hover={{ bg: 'snow.100', color: 'night.400' }} onClick={handleCloseDeposit}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}

export default ManageInventory
