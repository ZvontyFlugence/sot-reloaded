import Layout from '../../components/layout/Layout'
import { useUser } from '../../core/context/UserContext'
import request from '../../core/request'
import showToast from '../../core/uiHelpers/showToast'
import { Button } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { useToast } from '@chakra-ui/toast'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'
import useSWR from 'swr'
import { useEffect, useState } from 'react'
import MailItem from '../../components/sidebar-items/MailItem'
import { IMail } from '../../core/interfaces'
import ComposeMail from '../../components/sidebar-items/ComposeMail'

const mailFetcher = (url: string) => request({ url, method: 'GET' })

const Mail: React.FC = () => {
	const router = useRouter()
	const toast = useToast()
	const user = useUser()

	const [mail, setMail] = useState<IMail[]>([])

	const { isOpen, onOpen, onClose } = useDisclosure()

	const { data } = useSWR('/api/me/mail', mailFetcher)

	useEffect(() => {
		if (data?.mail) setMail(data?.mail)
	}, [data])

	const readAll = () => {}

	const deleteAll = () => {}

	return user ? (
		<Layout>
			<div className='flex flex-col w-full'>
				<h2 className='text-2xl font-semibold text-aurora-red'>My Mail</h2>
				<div className='flex justify-center md:justify-end gap-4 mt-2'>
					<Button variant='solid' size='sm' colorScheme='' bgColor='aurora.green' color='snow.100' onClick={onOpen}>
						Compose
					</Button>
					<Button variant='solid' size='sm' colorScheme='' bgColor='frost.300' color='snow.100' onClick={readAll}>
						Read All
					</Button>
					<Button variant='solid' size='sm' colorScheme='' bgColor='aurora.red' color='snow.100' onClick={deleteAll}>
						Delete All
					</Button>
				</div>
				{mail.length > 0 ? (
					<div className='mt-4 mx-0 md:mx-12 bg-night-400 shadow-md rounded'>
						{mail
							.filter((m) => !!m.thread)
							.map((m) => (
								<MailItem key={m.threadId} mail={m} />
							))}
					</div>
				) : (
					<p className='mt-4 mx-0 md:mx-12 bg-night-400 text-snow-100 shadow-md rounded py-2 px-4'>
						You do not have any mail
					</p>
				)}
			</div>
			<ComposeMail isOpen={isOpen} onClose={onClose} />
		</Layout>
	) : null
}

export default Mail

export const getServerSideProps: GetServerSideProps = async (context) => {
	let { req } = context
	const session = await getSession({ req })

	if (!session || !session.user.id) {
		return {
			redirect: { destination: '/login', permanent: false },
		}
	}

	return { props: {} }
}
