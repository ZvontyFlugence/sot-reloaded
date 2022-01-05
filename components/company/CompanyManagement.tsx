import { useUser } from '@/core/context/UserContext'
import { ICompany, IWalletInfo } from '@/core/interfaces'
import request from '@/core/request'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import CompanySettings from './management/CompanySettings'
import ManageEmployees from './management/ManageEmployees'
import ManageInventory from './management/ManageInventory'
import ManageJobOffers from './management/ManageJobOffers'
import ManageProductOffers from './management/ManageProductOffers'
import ManageTreasury from './management/ManageTreasury'

interface CompManagementProps {
	company: ICompany
	currency: string
}

const walletFetcher = (url: string) => request({ url, method: 'GET' })

const CompanyManagement: React.FC<CompManagementProps> = ({ company, currency }) => {
	const [wallet, setWallet] = useState<IWalletInfo[]>([])

	const { data: walletData } = useSWR('/api/me/wallet-info', walletFetcher)

	useEffect(() => {
		if (walletData?.walletInfo) setWallet(walletData.walletInfo)
	}, [walletData])

	return (
		<div className='w-full'>
			<Tabs variant='enclosed'>
				<div className='bg-night-400 text-white rounded shadow-md overflow-x-auto overflow-y-hidden'>
					<TabList borderColor='frost.100'>
						<Tab _selected={{ color: 'frost.100' }}>Product Offers</Tab>
						<Tab _selected={{ color: 'frost.100' }}>Job Offers</Tab>
						<Tab _selected={{ color: 'frost.100' }}>Employees</Tab>
						<Tab _selected={{ color: 'frost.100' }}>Inventory</Tab>
						<Tab _selected={{ color: 'frost.100' }}>Treasury</Tab>
						<Tab _selected={{ color: 'frost.100' }}>Settings</Tab>
					</TabList>
				</div>
				<div className='bg-night-400 text-white mt-4 rounded shadow-md'>
					<TabPanels>
						<TabPanel>
							<ManageProductOffers productOffers={company.productOffers ?? []} companyId={company.id} />
						</TabPanel>
						<TabPanel>
							<ManageJobOffers
								jobOffers={company.jobOffers ?? []}
								companyId={company.id}
								currency={currency}
							/>
						</TabPanel>
						<TabPanel>
							<ManageEmployees
								employees={company.employees ?? []}
								compId={company.id}
								currency={currency}
							/>
						</TabPanel>
						<TabPanel>
							<ManageInventory
								inventory={company.inventory ?? []}
								compId={company.id}
								currency={currency}
							/>
						</TabPanel>
						<TabPanel>
							<ManageTreasury
								funds={company.funds ?? []}
								wallet={wallet ?? []}
								compId={company.id}
								currencyCode={currency}
								gold={Number.parseFloat(company.gold)}
							/>
						</TabPanel>
						<TabPanel>
							<CompanySettings company={company} />
						</TabPanel>
					</TabPanels>
				</div>
			</Tabs>
		</div>
	)
}

export default CompanyManagement
