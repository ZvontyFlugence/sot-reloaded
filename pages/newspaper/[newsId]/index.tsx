import Layout from '@/components/layout/Layout'
import NewsBody from '@/components/newspaper/NewsBody'
import NewsHeader from '@/components/newspaper/NewsHeader'
import withPrisma from '@/core/prismaClient'
import { Prisma } from '@prisma/client'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useState } from 'react'

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

interface NewsProps {
	newspaper: NewspaperWithAuthor
}

const NewspaperPage: React.FC<NewsProps> = ({ newspaper }) => {
	const [manageMode, setManageMode] = useState<boolean>(false)

	const toggleMode = () => {
		setManageMode((prev) => !prev)
	}

	return (
		<Layout>
			<div className='flex flex-col items-center gap-4 w-full'>
				<NewsHeader newspaper={newspaper} onManage={toggleMode} />
				<NewsBody newspaper={newspaper} />
			</div>
		</Layout>
	)
}

export default NewspaperPage

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { req, params } = ctx
	const session = await getSession({ req })

	if (!session || !session.user.id)
		return {
			redirect: { destination: '/', permanent: false },
		}

	let newspaper = await withPrisma(async (client) => {
		return await client.newspaper.findUnique({
			where: { id: Number.parseInt(params?.newsId as string) },
			include: {
				author: {
					select: {
						id: true,
						image: true,
						username: true,
					},
				},
				articles: true,
				subscribers: { select: { id: true } },
			},
		})
	})

	if (!newspaper)
		return {
			redirect: { destination: '/newspaper', permanent: false },
		}

	return {
		props: { newspaper: JSON.parse(JSON.stringify(newspaper)) },
	}
}
