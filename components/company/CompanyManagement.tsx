import { useUser } from '@/core/context/UserContext'
import { ICompany } from '@/core/interfaces'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import ManageEmployees from './management/ManageEmployees'
import ManageInventory from './management/ManageInventory'
import ManageJobOffers from './management/ManageJobOffers'
import ManageProductOffers from './management/ManageProductOffers'

interface CompManagementProps {
	company: ICompany
	currency: string
}

const CompanyManagement: React.FC<CompManagementProps> = ({ company, currency }) => {
	const user = useUser()

	return (
		<div className='w-full'>
			<Tabs variant='enclosed'>
				<div className='bg-night-400 text-white rounded shadow-md overflow-x-auto overflow-y-hidden'>
					<TabList borderColor='frost.100'>
						<Tab _selected={{ color: 'aurora.red' }}>Product Offers</Tab>
						<Tab _selected={{ color: 'aurora.red' }}>Job Offers</Tab>
						<Tab _selected={{ color: 'aurora.red' }}>Employees</Tab>
						<Tab _selected={{ color: 'aurora.red' }}>Inventory</Tab>
						<Tab _selected={{ color: 'aurora.red' }}>Treasury</Tab>
						<Tab _selected={{ color: 'aurora.red' }}>Settings</Tab>
					</TabList>
				</div>
				<div className='bg-night-400 text-white mt-4 rounded shadow-md'>
					<TabPanels>
						<TabPanel>
							<ManageProductOffers productOffers={company.productOffers ?? []} companyId={company.id} />
						</TabPanel>
						<TabPanel>
							<ManageJobOffers jobOffers={company.jobOffers ?? []} companyId={company.id} currency={currency} />
						</TabPanel>
						<TabPanel>
							<ManageEmployees employees={company.employees ?? []} compId={company.id} currency={currency} />
						</TabPanel>
						<TabPanel>
							<ManageInventory inventory={company.inventory ?? []} compId={company.id} currency={currency} />
						</TabPanel>
						<TabPanel></TabPanel>
						<TabPanel></TabPanel>
					</TabPanels>
				</div>
			</Tabs>
		</div>
	)
}

export default CompanyManagement
