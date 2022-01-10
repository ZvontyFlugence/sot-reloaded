import { IFriend } from '@/core/interfaces'
import { Avatar } from '@chakra-ui/avatar'
import { useRouter } from 'next/router'

interface FriendsListProps {
	friends: IFriend[]
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
	const router = useRouter()

	return (
		<div className='grid grid-cols-1 md:grid-cols-5 p-4'>
			{friends && friends.length > 0 ? (
				friends.map((friend) => (
					<div
						key={friend.id}
						className='flex flex-col items-center cursor-pointer rounded shadow-md border border-snow-100 border-opacity-25 p-2'
						onClick={() => router.push(`/profile/${friend.id}`)}
					>
						<Avatar boxSize='3.0rem' src={friend.image} alt={friend.username} />
						<span className='text-sm text-frost-100 font-semibold text-center'>{friend.username}</span>
					</div>
				))
			) : (
				<p className='col-span-1 md:col-span-5 text-center text-lg text-snow-100'>No friends</p>
			)}
		</div>
	)
}

export default FriendsList
