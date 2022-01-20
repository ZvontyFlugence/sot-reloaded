import { IActivities, IUser } from '@/core/interfaces'
import { Avatar } from '@chakra-ui/avatar'
import { StackDivider, VStack } from '@chakra-ui/layout'
import { useColorModeValue } from '@chakra-ui/system'
import { useRouter } from 'next/router'

interface ProfileActivitiesProps {
	profile: IUser
	activities: IActivities
}

const ProfileActivities: React.FC<ProfileActivitiesProps> = ({ profile, activities }) => {
	const router = useRouter()

	// TODO: Figure out how to check if profile is a congressperson or exec branch member
	const getPartyTitle = () => {
		const { partyInfo: party } = activities
		switch (profile.id) {
			case party?.president:
				return 'Party President'
			case party?.vp:
				return 'Party Vice President'
			default:
				return 'Party Member'
		}
	}

	// Figure out how to check if profile is MoD
	const getArmyTitle = () => {
		const { unitInfo: unit } = activities
		switch (profile.id) {
			case unit?.co:
				return 'Commanding Officer'
			case unit?.xo:
				return 'Executive Officer'
			default:
				return 'Soldier'
		}
	}

	const getNewsTitle = () => {
		const { newsInfo: news } = activities
		switch (profile.id) {
			case news?.authorId:
				return 'Owner'
			default:
				return 'Editor'
		}
	}

	return (
		<div
			className={`${useColorModeValue(
				'bg-snow-300 text-night-300',
				'bg-night-400 text-snow-100'
			)} p-4 shadow-md rounded`}
		>
			<VStack className='flex flex-col items-center gap-2' divider={<StackDivider borderColor='snow.100' />}>
				<div
					className='flex flex-col items-center gap-0.5 cursor-pointer'
					onClick={() => router.push(`/company/${activities.jobInfo?.compId}`)}
				>
					<p className='font-semibold text-aurora-red text-md'>Job</p>
					{activities.jobInfo ? (
						<div className='flex flex-col items-center gap-2'>
							<Avatar size='lg' src={activities.jobInfo.comp.image} name={activities.jobInfo.comp.name} />
							<span className='text-sm font-semibold text-center'>{activities.jobInfo.comp.name}</span>
							<span className='text-sm text-center'>{activities.jobInfo.title}</span>
						</div>
					) : (
						<p>None</p>
					)}
				</div>
				<div
					className='flex flex-col text-center gap-0.5 cursor-pointer'
					onClick={() => router.push(`/party/${profile.partyId}`)}
				>
					<p className='font-semibold text-aurora-red text-md'>Political Party</p>
					{activities.partyInfo ? (
						<div className='flex flex-col items-center gap-2'>
							<Avatar size='lg' src={activities.partyInfo.image} name={activities.partyInfo.name} />
							<p className='text-sm font-semibold text-center'>{activities.partyInfo.name}</p>
							<p className='text-sm text-center'>{getPartyTitle()}</p>
						</div>
					) : (
						<p>None</p>
					)}
				</div>
				<div
					className='flex flex-col text-center gap-0.5 cursor-pointer'
					onClick={() => router.push(`/party/${profile.unitId}`)}
				>
					<p className='font-semibold text-aurora-red text-md'>Military Unit</p>
					{activities.unitInfo ? (
						<div className='flex flex-col items-center gap-2'>
							<Avatar size='lg' src={activities.unitInfo.image} name={activities.unitInfo.name} />
							<p className='text-sm font-semibold text-center'>{activities.unitInfo.name}</p>
							<p className='text-sm text-center'>{getArmyTitle()}</p>
						</div>
					) : (
						<p>None</p>
					)}
				</div>
				<div
					className='flex flex-col text-center gap-0.5 cursor-pointer'
					onClick={() => router.push(`/party/${profile.newsId}`)}
				>
					<p className='font-semibold text-aurora-red text-md'>Newspaper</p>
					{activities.newsInfo ? (
						<div className='flex flex-col items-center gap-2'>
							<Avatar size='lg' src={activities.newsInfo.image} name={activities.newsInfo.name} />
							<p className='text-sm font-semibold text-center'>{activities.newsInfo.name}</p>
							<p className='text-sm text-center'>{getNewsTitle()}</p>
						</div>
					) : (
						<p>None</p>
					)}
				</div>
			</VStack>
		</div>
	)
}

export default ProfileActivities
