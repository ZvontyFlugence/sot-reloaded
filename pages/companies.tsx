import { Company } from '.prisma/client'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { AddIcon } from '@chakra-ui/icons'
import { Input } from '@chakra-ui/input'
import { List, ListItem } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Layout from '@/components/layout/Layout'
import Select from '@/components/shared/Select'
import { useUser } from '../core/context/UserContext'
import request from '../core/request'
import { CompanyTypes } from '@/core/constants'
import { Image, useToast } from '@chakra-ui/react'
import showToast from '@/core/uiHelpers/showToast'
import { useRouter } from 'next/router'

const companiesFetcher = (url: string) => request({ url, method: 'GET' })

const MyCompanies: React.FC = () => {
    const router = useRouter()
    const toast = useToast()
    const user = useUser()

    const [companies, setCompanies] = useState<Company[]>([])
    const [name, setName] = useState<string>('')
    const [type, setType] = useState<number>(0)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const { data, mutate } = useSWR('/api/me/companies', companiesFetcher) 

    useEffect(() => {
        if (data?.companies)
            setCompanies(data.companies)
    }, [data])

    const handleClose = () => {
        setName('')
        setType(0)
        onClose()
    }

    const handleCreateComp = () => {
        if (user && Number.parseFloat(user.gold.toString()) >= 25 && name) {
            request({
                url: '/api/companies/create',
                method: 'POST',
                body: { name, type }
            }).then(data => {
                if (data.success) {
                    showToast(toast, 'success', 'Company Created')
                    onClose()
                    mutate()
                    router.push(`/company/${data.companyId}`)
                } else {
                    showToast(toast, 'error', 'Company Creation Error', data?.error)
                }
            })
        } else if (user && Number.parseFloat(user.gold.toString()) < 25) {
            showToast(toast, 'error', 'Company Creation Error', 'Insufficient Funds')
        } else {
            showToast(toast, 'error', 'Company Creation Error', 'Company Must Have A Name')
        }
    }

    return user ? (
        <Layout>
            <div className='flex flex-col w-full'>
                <h2 className='text-2xl text-aurora-red font-semibold'>My Companies</h2>
                <div className='flex justify-center md:justify-end mt-2'>
                    <Button
                        variant='solid'
                        size='sm'
                        colorScheme=''
                        bgColor='frost.300'
                        color='snow.100'
                        onClick={onOpen}
                        leftIcon={<AddIcon />}
                    >
                        Create Company
                    </Button>
                </div>
                <List className='mt-4' spacing={3} bgColor='night.400'>
                    {companies.length > 0 ? companies.map((comp: Company) => (
                        <ListItem key={comp.id} className='flex justify-between cursor-pointer' onClick={() => router.push(`/company/${comp.id}`)}>
                            <div className='flex items-center gap-2'>
                                <Image boxSize='50px' src={comp.image} alt='' />
                                <span className='text-lg'>{comp.name}</span>
                            </div>
                            <div className='flex items-center gap-2 pr-2'>
                                <i className={CompanyTypes[comp.type]?.css} />
                                <span>{CompanyTypes[comp.type].text}</span>
                            </div>
                        </ListItem>
                    )) : (
                        <p className='py-2 px-4 rounded-lg shadow-md'>
                            You do not own any companies
                        </p>
                    )}
                </List>

                <Modal isOpen={isOpen} onClose={handleClose}>
                    <ModalOverlay />
                    <ModalContent bgColor='night.400' color='snow.100'>
                        <ModalHeader>Create Company</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody className='flex flex-col gap-4'>
                            <FormControl>
                                <FormLabel>Company Name</FormLabel>
                                <Input type='text' value={name} onChange={e => setName(e.target.value)} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Company Type</FormLabel>
                                <Select className='relative border border-snow-100 rounded w-max' selected={type} onChange={val => setType(val as number)}>
                                    {CompanyTypes.map((compType) => (
                                        <Select.Option key={compType.item} value={compType.item}>
                                            <span>
                                                <i className={`${compType.css}`} /> {compType.text}
                                            </span>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </FormControl>
                            <p className='mt-2 text-center'>
                                Cost 25.00 <i className='sot-icon sot-coin' title='Gold' />
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant='solid'
                                colorScheme=''
                                bgColor='aurora.green'
                                color='snow.100'
                                disabled={user && Number.parseFloat(user.gold.toString()) < 25}
                                onClick={handleCreateComp}
                            >
                                Create
                            </Button>
                            <Button
                                className='ml-4'
                                variant='outline'
                                colorScheme=''
                                color='snow.100'
                                _hover={{ bg: 'snow.100', color: 'night.400' }}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </Layout>
    ) : null
}

export default MyCompanies

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context
    const session = await getSession({ req })

    if (!session || !session.user.id) {
        return {
            redirect: { destination: '/login', permanent: false }
        }
    }

    return { props: {} }
}