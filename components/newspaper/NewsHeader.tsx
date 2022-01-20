import { useUser } from '@/core/context/UserContext'
import { EditIcon } from '@chakra-ui/icons'
import { Avatar, IconButton, Image, Stat, StatLabel, StatNumber, Tag } from '@chakra-ui/react'
import { Prisma } from '@prisma/client'
import { useRouter } from 'next/router'
import { useColorModeValue } from '@chakra-ui/system'

const newspaperWithAuthor = Prisma.validator<Prisma.NewspaperArgs>()({
	include: {
		author: {
			select: { id: true, image: true, username: true },
		},
		articles: true,
		subscribers: { select: { id: true } },
	},
})

type NewspaperWithAuthor = Prisma.NewspaperGetPayload<typeof newspaperWithAuthor>

interface NewsHeaderProps {
	newspaper: NewspaperWithAuthor
	onManage: () => void
}

const NewsHeader: React.FC<NewsHeaderProps> = ({ newspaper, onManage }) => {
	const router = useRouter()
	const user = useUser()

	return (
		<>
			<div
				className={`p-4 w-full ${useColorModeValue('bg-snow-300', 'bg-night-400')} ${useColorModeValue(
					'text-night-400',
					'text-snow-100'
				)}} rounded shadow-md`}
			>
				<div className='flex items-stretch gap-4'>
					<Image boxSize='10.0rem' src={newspaper.image} alt={newspaper.name} />
					<div className='flex flex-col w-full items-start'>
						<h3 className='text-xl font-semibold text-aurora-red'>{newspaper.name}</h3>
						<p className='flex items-center mt-2'>
							Author:{' '}
							<Tag
								className='flex gap-2 link'
								bgColor='transparent'
								onClick={() => router.push(`/profile/${newspaper.author?.id}`)}
							>
								<Avatar boxSize='3.0rem' src={newspaper.author?.image} name={newspaper.author?.username} />
								<span>{newspaper.author?.username}</span>
							</Tag>
						</p>
						<div className='mt-2'>
							<Stat>
								<StatLabel>Subscribers</StatLabel>
								<StatNumber className='text-center'>{newspaper.subscribers.length}</StatNumber>
							</Stat>
						</div>
					</div>
					<div className='flex flex-col justify-self-start self-start'>
						<IconButton
							aria-label='Manage Newspaper'
							variant='outline'
							colorScheme=''
							icon={<EditIcon />}
							disabled={user?.id !== newspaper.author?.id}
							onClick={onManage}
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default NewsHeader
