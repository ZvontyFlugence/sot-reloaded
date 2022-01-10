import Layout from '@/components/layout/Layout'
import FriendsList from '@/components/profile/FriendsList'
import ProfileActivities from '@/components/profile/ProfileActivities'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileStats from '@/components/profile/ProfileStats'
import { IActivities, IFriend, IUser } from '@/core/interfaces'
import withPrisma from '@/core/prismaClient'
import { PrismaClient } from '@prisma/client'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'

interface ProfileProps {
	profile: IUser
	friends: IFriend[]
	activities: IActivities
}

const Profile: React.FC<ProfileProps> = ({ profile, friends, activities }) => {
	return (
		<Layout>
			<div className='flex flex-col w-full'>
				<div className='px-2 md:px-12'>
					<ProfileHeader profile={profile} />
					<div className='flex gap-2 md:gap-4 mt-4'>
						<div className='w-1/2 md:w-1/4'>
							<ProfileActivities profile={profile} activities={activities} />
						</div>
						<div className='w-1/2 md:w-3/4 flex flex-col gap-4'>
							<div className='bg-night-400 text-snow-100 p-4 shadow-md rounded'>
								<p className='font-semibold text-aurora-red text-xl'>
									<ProfileStats profile={profile} />
								</p>
							</div>
							<div className='bg-night-400 text-snow-100 p-4 shadow-md rounded'>
								<p className='font-semibold text-aurora-red text-xl'>
									<FriendsList friends={friends} />
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	)
}

export default Profile

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req, params } = context
	const session = await getSession({ req })

	if (!session || !session.user.id) {
		return {
			redirect: { destination: '/login', permanent: false },
		}
	}

	let { profile, friends, ...info } = await withPrisma(async (client: PrismaClient) => {
		const profile = (await client.user.findFirst({
			where: { id: Number.parseInt(params?.id as string) },
			include: {
				country: true,
				location: {
					include: { owner: true },
				},
				residence: {
					include: { owner: true },
				},
				friends: true,
				pendingFriends: true,
			},
		})) as IUser | null

		if (!profile) return { profile: null }

		const friends = await client.user.findMany({
			where: { id: { in: profile?.friends?.map((f) => f.friendId) ?? [] } },
			select: {
				id: true,
				username: true,
				image: true,
			},
		})

		const jobInfo = await client.jobRecord.findFirst({
			where: { id: profile?.jobId },
			include: {
				comp: {
					select: {
						ceoId: true,
						id: true,
						image: true,
						name: true,
					},
				},
			},
		})

		const partyInfo = await client.party.findFirst({
			where: { id: profile?.partyId },
		})

		const newsInfo = await client.newspaper.findFirst({
			where: { id: profile?.newsId },
		})

		const unitInfo = await client.unit.findFirst({
			where: { id: profile?.unitId },
		})

		return { profile, friends, jobInfo, partyInfo, newsInfo, unitInfo }
	})

	if (!profile) {
		return {
			redirect: { destination: '/404', permanent: false },
		}
	}

	delete profile.password

	return {
		props: {
			profile: JSON.parse(JSON.stringify(profile)),
			friends: JSON.parse(JSON.stringify(friends)),
			activities: JSON.parse(JSON.stringify(info)),
		},
	}
}
