import { IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { Box, Container } from '@chakra-ui/layout'
import { Drawer, DrawerContent, DrawerOverlay } from '@chakra-ui/modal'
import { useUser } from '../../core/context/UserContext'
import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout: React.FC = ({ children }) => {
	const user = useUser()
	const { isOpen, onOpen, onClose } = useDisclosure()

	return (
		<>
			<div className='relative w-full'>
				<Container maxW='container.lg'>
					<Header user={user} />
					<Box
						display='flex'
						flexDir='row'
						alignItems='flex-start'
						gap={8}
						className='mt-8 md:mt-2 min-h-[43rem] pb-10 w-full'
					>
						{user && (
							<>
								<div className='fixed left-0 top-14 md:hidden'>
									<IconButton
										aria-label='Toggle Sidebar'
										bgColor='night.400'
										color='aurora.red.500'
										icon={<ChevronLeftIcon className='text-2xl' />}
										onClick={onOpen}
									/>
								</div>
								<div className='hidden md:block'>
									<Sidebar user={user} />
								</div>
							</>
						)}
						{children}
					</Box>
					<Footer />
				</Container>
			</div>
			<Drawer
				isOpen={isOpen}
				placement='left'
				onClose={onClose}
				size='full'
				closeOnOverlayClick
			>
				<DrawerOverlay />
				<DrawerContent className='pointer-events-none' bgColor='transparent'>
					<div className='relative -mt-16'>
						<div className='absolute top-1/2 transform translate-y-1/2 w-full'>
							{user && <Sidebar user={user} />}
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</>
	)
}

export default Layout
