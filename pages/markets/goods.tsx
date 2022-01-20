import Layout from '@/components/layout/Layout'
import { InventoryItem } from '@/components/shared/Inventory'
import Select from '@/components/shared/Select'
import { ITEMS } from '@/core/constants'
import { useUser } from '@/core/context/UserContext'
import withPrisma from '@/core/prismaClient'
import request from '@/core/request'
import { Avatar, Button, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { Country, Currency, Prisma, PrismaClient, ProductOffer } from '@prisma/client'
import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useColorModeValue } from '@chakra-ui/system'

interface GoodsMarketProps {
	defaultCountryId: number
	countries: (Country & { currency: Currency })[]
}

type ProductOfferExtended = ProductOffer & {
	comp: {
		id: number
		name: string
		image: string
		type: number
	}
}

const getCountryGoodsOffersFetcher = (url: string) => request({ url, method: 'GET' })

const GoodsMarket: NextPage<GoodsMarketProps> = ({ countries, defaultCountryId }) => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()

	const [country, setCountry] = useState<number>(defaultCountryId)
	const [productOffers, setProductOffers] = useState<ProductOfferExtended[]>([])
	const [quantity, setQuantity] = useState<number>(1)
	const [itemFilter, setItemFilter] = useState<number>(-1)
	const [qualityFilter, setQualityFilter] = useState<number>(0)

	const { data: productOfferData } = useSWR(`/api/markets/goods?country_id=${country}`, getCountryGoodsOffersFetcher)

	useEffect(() => {
		if (productOfferData?.productOffers) setProductOffers(productOfferData.productOffers)
	}, [productOfferData])

	useEffect(() => {
		if (itemFilter > -1)
			setProductOffers(
				(productOfferData?.productOffers as ProductOfferExtended[]).filter((offer) => {
					if (ITEMS[itemFilter].quality === 0) {
						// Raw Resource
						return offer.itemId === itemFilter
					} else {
						// Manufactured Product
						if (qualityFilter === 0) {
							const diff = offer.itemId - itemFilter
							return diff <= 5 && diff >= 0
						} else return offer.itemId === itemFilter + quantity - 1
					}
				})
			)
	}, [itemFilter, qualityFilter])

	const canPurchase = (priceString: Prisma.Decimal) => {
		let price = Number.parseFloat(priceString.toString())
		return true
	}

	const purchaseProduct = (offerId: number) => {}

	return user ? (
		<Layout>
			<div className='flex flex-col w-full'>
				<h1 className='flex justify-between'>
					<span className='text-2xl font-semibold text-aurora-red'>Goods Market</span>
					<div>
						<Select
							className='relative border border-white border-opacity-25 rounded shadow-md'
							selected={country}
							onChange={(val) => setCountry(val)}
						>
							{countries.map((c: Country, i: number) => (
								<Select.Option key={i} value={c.id}>
									<div className='flex !items-center gap-2'>
										<span>{c.name}</span>
										<span className='sot-flag-wrap'>
											<i className={`sot-flag sot-flag-${c.flagCode} h-8`} />
										</span>
									</div>
								</Select.Option>
							))}
						</Select>
					</div>
				</h1>
				<div className='flex justify-center gap-4'>
					<Select
						className={`relative border ${useColorModeValue(
							'border-night-300',
							'border-snow-100'
						)} border-opacity-25 rounded shadow-md`}
						selected={itemFilter}
						onChange={(val) => setItemFilter(val)}
					>
						<Select.Option key={-1} value={-1}>
							<span>Any Item</span>
						</Select.Option>
						{ITEMS.filter((item) => item.quality <= 1).map((item, i) => (
							<Select.Option key={i} value={item.id}>
								<div className='flex items-center gap-2'>
									<span>{item.name}</span>
									<i className={item.image} title={item.name} />
								</div>
							</Select.Option>
						))}
					</Select>
					{itemFilter !== -1 && (ITEMS.at(itemFilter)?.quality ?? 0) > 0 && (
						<Select
							className={`relative border ${useColorModeValue(
								'border-night-300',
								'border-snow-100'
							)} border-opacity-25 rounded shadow-md`}
							selected={qualityFilter}
							onChange={(val) => setQualityFilter(val)}
						>
							<Select.Option value={0}>Any Quality</Select.Option>
							<Select.Option value={1}>Q1</Select.Option>
							<Select.Option value={2}>Q2</Select.Option>
							<Select.Option value={3}>Q3</Select.Option>
							<Select.Option value={4}>Q4</Select.Option>
							<Select.Option value={5}>Q5</Select.Option>
						</Select>
					)}
				</div>
				<div className={`mt-4 ${useColorModeValue('bg-snow-300', 'bg-night-400')} rounded-md shadow-md`}>
					{productOffers.length === 0 ? (
						<p className='p-4'>Counry has no product offers</p>
					) : (
						<>
							{/* TODO: Product Type and Quality Filters */}
							<Table
								variant='unstyled'
								bgColor={useColorModeValue('snow.300', 'night.400')}
								color={useColorModeValue('night.300', 'snow.100')}
							>
								<Thead>
									<Tr>
										<Th color={useColorModeValue('night.300', 'snow.100')}>Company</Th>
										<Th color={useColorModeValue('night.300', 'snow.100')}>Product</Th>
										<Th color={useColorModeValue('night.300', 'snow.100')}>Price Per Unit</Th>
										<Th color={useColorModeValue('night.300', 'snow.100')}>Action</Th>
									</Tr>
								</Thead>
								<Tbody>
									{productOffers.map((offer: ProductOfferExtended, i: number) => (
										<Tr key={i}>
											<Td>
												<div
													className='flex items-center gap-2 link'
													onClick={() => router.push(`/company/${offer.compId}`)}
												>
													<Avatar src={offer.comp.image} name={offer.comp.name} />
													{offer.comp.name}
												</div>
											</Td>
											<Td>
												<InventoryItem
													item={{ id: offer.id, itemId: offer.itemId, quantity: offer.quantity }}
													index={0}
													displayOnly
												/>
											</Td>
											<Td>
												{Number.parseFloat(offer.price.toString()).toFixed(2)}{' '}
												{countries.find((c) => c.id === country)?.currency.code ?? ''}
											</Td>
											<Td>
												<Button
													variant='solid'
													size='sm'
													bgColor={canPurchase(offer.price) ? 'frost.400' : 'aurora.red'}
													color='snow.100'
													colorScheme=''
													isDisabled={!canPurchase(offer.price)}
													onClick={() => purchaseProduct(offer.id)}
												>
													Purchase
												</Button>
											</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</>
					)}
				</div>
			</div>
		</Layout>
	) : null
}

export default GoodsMarket

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (!session || !session.user.id)
		return {
			redirect: { destination: '/', permanent: false },
		}

	let [user, countries] = await withPrisma(async (client: PrismaClient) => {
		const user = await client.user.findUnique({
			where: { id: session.user.id },
			select: {
				location: {
					select: {
						ownerId: true,
					},
				},
			},
		})

		const countries = await client.country.findMany({
			include: {
				currency: true,
			},
		})

		return [user, countries]
	})

	if (!user)
		return {
			redirect: { destination: '/dashboard', permanent: false },
		}

	return {
		props: {
			defaultCountryId: user.location.ownerId,
			countries: JSON.parse(JSON.stringify(countries)),
		},
	}
}
