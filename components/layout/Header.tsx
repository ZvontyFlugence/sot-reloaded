import { User } from '.prisma/client'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/accordion'
import { Button } from '@chakra-ui/button'
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import { Image } from '@chakra-ui/image'
import { Box, HStack } from '@chakra-ui/layout'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

interface HeaderProps {
    user?: User
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    const router = useRouter()

    const getHomeLink = (): string => {
        return user ? '/dashboard' : '/'
    }
    
    const getPartyLink = (): string => {
        return user && user.partyId > 0 ? `/party/${user.partyId}` : '/dashboard'
    }

    const getNewsLink = (): string => {
        return user && user.newsId > 0 ? `/newspaper/${user.newsId}` : '/dashboard'
    }

    const getUnitLink = (): string => {
        return user && user.unitId > 0 ? `/party/${user.unitId}` : '/dashboard'
    }

    const logout = () => {
        signOut({ callbackUrl: `${window.location.origin}` })
    }

    return (
        <>
            <div className='hidden md:block'>
                <HStack className='h-16 mb-4' justifyContent='space-between'>
                    <HStack className='cursor-pointer' onClick={() => router.push(getHomeLink())}>
                        <Image boxSize='3rem' src='/logo_banner.png' name='State of Turmoil Logo' />
                        <h1 className='text-2xl'>State of Turmoil</h1>
                    </HStack>
                    {!user ? (
                        <HStack spacing={6}>
                            <span className='cursor-pointer' onClick={() => router.push('/login')}>Login</span>
                            <span className='cursor-pointer' onClick={() => router.push('/register')}>Register</span>
                        </HStack>
                    ) : (
                        <HStack spacing={6}>
                            <Menu>
                                <MenuButton _hover={{ color: 'frost.100' }}>
                                    <span className='mr-2'>My Places</span>
                                    <ChevronDownIcon />
                                </MenuButton>
                                <MenuList bgColor='night.400'>
                                    <MenuItem _hover={{ bg: 'frost.100', color: 'night.400' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/home')}>My Home</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100', color: 'night.400' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/companies')}>My Companies</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100', color: 'night.400' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(getPartyLink())}>My Party</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100', color: 'night.400' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(getNewsLink())}>My Newspaper</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100', color: 'night.400' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(getUnitLink())}>My Army</MenuItem>
                                </MenuList>
                            </Menu>
                            <Menu>
                                <MenuButton _hover={{ color: 'frost.100' }}>
                                    <span className='mr-2'>Markets</span>
                                    <ChevronDownIcon />
                                </MenuButton>
                                <MenuList bgColor='night.400'>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/markets/goods')}>Goods</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/markets/job')}>Jobs</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }}>Exchange</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }}>Companies</MenuItem>
                                </MenuList>
                            </Menu>
                            <Box className='cursor-pointer' _hover={{ color: 'frost.100' }} onClick={() => router.push('/battles')}>Battles</Box>
                            <Menu>
                                <MenuButton _hover={{ color: 'frost.100' }}>
                                    <span className='mr-2'>Social</span>
                                    <ChevronDownIcon />
                                </MenuButton>
                                <MenuList bgColor='night.400'>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(`/country/${user.countryId}`)}>My Country</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/elections')}>Elections</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/rankings')}>Rankings</MenuItem>
                                </MenuList>
                            </Menu>
                            <Box className='cursor-pointer' _hover={{ color: 'frost.100' }} onClick={() => router.push('/map')}>World Map</Box>
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    size='sm'
                                    colorScheme=''
                                    bgColor='night.400'
                                    color='snow.100'
                                    _hover={{ color: 'aurora.red.500' }}
                                    _active={{ color: 'aurora.red.500' }}
                                    rightIcon={<ChevronDownIcon />}
                                >
                                    Account
                                </MenuButton>
                                <MenuList bgColor='night.400'>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(`/profile/${user.id}`)}>Profile</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/settings')}>Settings</MenuItem>
                                    <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={logout}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                    )}
                </HStack>
            </div>
            <div className='block md:hidden'>
                <HStack className='h-16 mb-4 pl-2 pr-4' justifyContent='space-between'>
                    <HStack className='cursor-pointer' onClick={() => router.push(getHomeLink())}>
                        <Image boxSize='3rem' src='/logo_banner.png' name='State of Turmoil Logo' />
                        <h1 className='text-2xl'>State of Turmoil</h1>
                    </HStack>
                    <Menu>
                        <MenuButton>
                            <HamburgerIcon className='text-xl' />
                        </MenuButton>
                        {!user ? (
                            <MenuList bgColor='night.400'>
                                <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/login')}>Login</MenuItem>
                                <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/register')}>Register</MenuItem>
                            </MenuList>
                        ) : (
                            <MenuList bgColor='night.400'>
                                <Accordion allowToggle>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left'>My Places</Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/home')}>My Home</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/companies')}>My Companies</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(getPartyLink())}>My Party</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(getNewsLink())}>My Newspaper</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(getUnitLink())}>My Army</MenuItem>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                                <Accordion allowToggle>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left'>Markets</Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/markets/goods')}>Goods</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/markets/job')}>Jobs</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }}>Exchange</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }}>Companies</MenuItem>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                                <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/battles')}>Battles</MenuItem>
                                <Accordion allowToggle>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left'>Social</Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(`/country/${user.countryId}`)}>My Country</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/elections')}>Elections</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/rankings')}>Rankings</MenuItem>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                                <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/map')}>World Map</MenuItem>
                                <Accordion allowToggle>
                                    <AccordionItem>
                                        <AccordionButton>
                                            <Box flex='1' textAlign='left'>Account</Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push(`/profile/${user.id}`)}>Profile</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={() => router.push('/settings')}>Settings</MenuItem>
                                            <MenuItem _hover={{ bg: 'frost.100' }} _focus={{ bg: 'frost.100' }} onClick={logout}>Logout</MenuItem>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                            </MenuList>
                        )}
                    </Menu>
                </HStack>
            </div>
        </>
    )
}

export default Header