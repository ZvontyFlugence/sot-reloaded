import { List, ListItem, Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Avatar } from '@chakra-ui/react'
import Card from '../shared/Card'
import request from '../../core/request'
import useSWR from 'swr'

interface CitizenStats {
    id: number
    username: string
    image: string
    country: {
        id: number
        name: string
        flagCode: string
    },
    strength?: number
    xp?: number
}

const topCitizensFetcher = (url: string) => request({ url, method: 'GET' })

const TopCitizens: React.FC = () => {
    const { data } = useSWR('/api/stats/user?scope=global&stat=xp&limit=5', topCitizensFetcher)

    return (
        <Card>
            <Card.Header className='text-xl text-center font-bold text-white'>
                <Text color='aurora.red.500'>Top Citizens</Text>
            </Card.Header>
            <Card.Content>
                {!data?.citizens ? (
                    <Spinner color='aurora.yellow.500' size='xl' />
                ) : (
                    <List>
                        {data?.citizens.map((c: CitizenStats) => (
                            <ListItem key={c.id} className='flex justify-between mt-4 text-white text-lg'>
                                <div className='flex justify-start items-center'>
                                    <Avatar boxSize='50px' src={c.image} name={c.username} />
                                    <span className='ml-4'>{c.username}</span>
                                </div>
                                <div className='flex justify-end items-center'>
                                    <span className='sot-wrap'>
                                        <i className={`sot-flag sot-flag-${c.country.flagCode} h-8`} />
                                    </span>
                                    <span className='ml-4'>{c.xp} XP</span>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Card.Content>
        </Card>
    )
}

export default TopCitizens
