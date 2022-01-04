import { Box, Heading, SimpleGrid } from '@chakra-ui/layout'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Dailies from '../components/dashboard/Dailies'
import Layout from '../components/layout/Layout'

const Dashboard: React.FC = () => {
    return (
        <Layout>
            <div className='flex flex-col w-full'>
                <Heading color='aurora.red.500' className='text-2xl font-semibold'>Dashboard</Heading>
                <div className='hidden md:block'>
                    <SimpleGrid w='full' columns={2} spacing={12}>
                        <Box display='flex' flexDir='column' gap={12}>
                            <Dailies />
                            <div>News here</div>
                        </Box>
                        <Box>
                            <div>Shouts here</div>
                        </Box>
                    </SimpleGrid>
                </div>
                <div className='block md:hidden'>
                    <Dailies />
                    <div>News here</div>
                    <div>Shouts here</div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context
    const session = await getSession({ req })

    if (!session) {
        return {
            redirect: { destination: '/login', permanent: false }
        }
    }

    return {
        props: {}
    }
}