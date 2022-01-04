import { IUser } from '@/core/interfaces'
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat'

interface ProfileStatsProps {
	profile: IUser
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
	return (
		<div className='text-snow-100 w-min'>
			<Stat>
				<StatLabel>
					<span className='font-semibold text-frost-100 text-lg'>Strength</span>
				</StatLabel>
				<StatNumber className='flex justify-center w-full'>
					<div className='flex items-center gap-2 px-1'>
						{profile.strength}
						<i className='sot-icon sot-str w-6' />
					</div>
				</StatNumber>
			</Stat>
		</div>
	)
}

export default ProfileStats
