import { ITEMS } from '@/core/constants'
import { useUser } from '@/core/context/UserContext'
import { ICompany } from '@/core/interfaces'
import { EditIcon } from '@chakra-ui/icons'
import { Avatar, IconButton, Image, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { useRouter } from 'next/router'

interface CompHeaderProps {
	company: ICompany
	onManage: () => void
}

const CompanyHeader: React.FC<CompHeaderProps> = ({ company, onManage }) => {
	const router = useRouter()
	const user = useUser()

	const displayStats = (
		<div className='grid grid-cols-2 mt-4 w-full'>
			<Stat>
				<StatLabel>Employees</StatLabel>
				<StatNumber>{company.employees?.length ?? 0}</StatNumber>
			</Stat>
			<Stat>
				<StatLabel>Worth</StatLabel>
				<StatNumber>
					<span className='mr-2'>{Number.parseInt(company.gold).toFixed(2)}</span>
					<i className='sot-icon sot-coin' />
				</StatNumber>
			</Stat>
		</div>
	)

	return (
		<>
			<div className='hidden md:block bg-night-400 text-snow-100 p-4 shadow-md rounded'>
				<div className='flex items-stretch gap-4'>
					<Image boxSize={'12.0rem'} borderRadius='full' src={company.image} alt={company.name} />
					<div className='flex flex-col w-full items-start'>
						<h3 className='text-2xl text-aurora-red font-semibold'>{company.name}</h3>
						<div className='flex items-center mt-4'>
							<p>
								<span className='mr-2'>Type:</span>
								<i className={ITEMS[company.type].image} title={ITEMS[company.type].name} />
							</p>
							<p className='ml-8'>
								<span className='mr-2'>Location:</span>
								<span className='link' onClick={() => router.push(`/region/${company.locationId}`)}>
									{company.location?.name}
								</span>
								,
								<span className='link ml-2' onClick={() => router.push(`/country/${company.location?.ownerId}`)}>
									{company.location?.owner?.name}
									<span className='ml-2 sot-flag-wrap'>
										<i className={`sot-flag sot-flag-${company.location?.owner?.flagCode} h-7`} />
									</span>
								</span>
							</p>
						</div>
						<span className='flex items-center mt-4'>
							<span className='mr-2'>CEO:</span>
							<span className='flex items-center link' onClick={() => router.push(`/profile/${company.ceoId}`)}>
								<Avatar size='sm' src={company.ceo?.image} name={company.ceo?.username} />
								<span className='ml-2'>{company.ceo?.username}</span>
							</span>
						</span>
						{displayStats}
					</div>
					<div className='flex flex-col justify-self-start self-start'>
						<IconButton
							aria-label='Manage Company Button'
							variant='outline'
							colorScheme=''
							icon={<EditIcon />}
							disabled={user?.id !== company.ceoId}
							onClick={onManage}
						/>
					</div>
				</div>
			</div>
			<div className='block md:hidden bg-night text-white p-4 shadow-md rounded'>
				<div className='flex flex-col items-stretch gap-2 w-full'>
					<div className='flex items-center gap-2'>
						<div className='flex gap-2 items-center flex-grow'>
							<Image boxSize='3.5rem' src={company.image} alt={company.name} />
							<h3 className='text-xl font-semibold text-aurora-red'>{company.name}</h3>
						</div>
						<IconButton
							aria-label='Manage Company Button'
							variant='outline'
							size='sm'
							colorScheme=''
							icon={<EditIcon />}
							disabled={user?.id !== company.ceoId}
							onClick={onManage}
						/>
					</div>
					<div className='text-sm'>
						<div className='flex flex-col items-start mt-4'>
							<p>
								<span className='mr-2'>Type:</span>
								<i className={ITEMS[company.type].image} title={ITEMS[company.type].name} />
							</p>
							<p>
								<span className='mr-2'>Location:</span>
								<span className='link' onClick={() => router.push(`/region/${company.locationId}`)}>
									{company.location?.name}
								</span>
								,
								<span className='link ml-2' onClick={() => router.push(`/country/${company.location?.ownerId}`)}>
									{company.location?.owner?.name}
									<span className='ml-2 sot-flag-wrap'>
										<i className={`sot-flag sot-flag-${company.location?.owner?.flagCode} h-7`} />
									</span>
								</span>
							</p>
						</div>
						<span className='flex items-center mt-4'>
							<span className='mr-2'>CEO:</span>
							<span className='flex items-center link' onClick={() => router.push(`/profile/${company.ceoId}`)}>
								<Avatar size='sm' src={company.ceo?.image} name={company.ceo?.username} />
								<span className='ml-2'>{company.ceo?.username}</span>
							</span>
						</span>
						{displayStats}
					</div>
				</div>
			</div>
		</>
	)
}

export default CompanyHeader
