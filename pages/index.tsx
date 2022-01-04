import { Image } from '@chakra-ui/image'
import { HStack, VStack } from '@chakra-ui/layout'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Features from '../components/index/Features'
import TopCitizens from '../components/index/TopCitizens'
import TopCountries from '../components/index/TopCountries'
import Layout from '../components/layout/Layout'

const Index: React.FC = () => {
    return (
        <Layout>
            <VStack w='full'>
                <Image boxSize='15.0rem' src='/logo_transparent.png' alt='State of Turmoil Logo' />
                <div className='hidden md:block'>
                    <HStack display='flex' alignItems='flex-start' w='full' className='mt-10' spacing={6}>
                        <TopCountries />
                        <Features />
                        <TopCitizens />
                    </HStack>
                </div>
                <div className='block md:hidden'>
                    <VStack display='flex' w='full' spacing={6}>
                        <Features />
                        <TopCountries />
                        <TopCitizens />
                    </VStack>
                </div>
            </VStack>
        </Layout>
    )
}

export default Index

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context
    const session = await getSession({ req })

    if (session) {
        return {
            redirect: { destination: '/dashboard', permanent: false }
        }
    }

    return { props: {} }
}