import { Country } from "@prisma/client"
import { List, ListItem, Text } from "@chakra-ui/layout"
import { Spinner } from "@chakra-ui/spinner"
import useSWR from "swr"
import request from "@/core/request"
import Card from "../shared/Card"

const topNationsFetcher = (url: string) => request({ url, method: 'GET' })

type CountryWithPopulation = (
    Country & {
        _count: {
            citizens: number
        }
    }
)

const TopCountries: React.FC = () => {
    const { data } = useSWR('/api/stats/country?stat=population&limit=5', topNationsFetcher)

    return (
        <Card>
            <Card.Header className='text-xl text-center font-bold text-white'>
                <Text color='aurora.red.500'>Top Countries</Text>
            </Card.Header>
            <Card.Content>
                {!data?.countries ? (
                    <Spinner color='aurora.yellow.500' size='xl' />
                ) : (
                    <List>
                        {data?.countries.map((c: CountryWithPopulation) => (
                            <ListItem key={c.id} className='flex justify-between mt-4 text-white text-lg'>
                                <div className='flex justify-start items-center'>
                                    <span className='sot-wrap'>
                                        <i className={`sot-flag sot-flag-${c.flagCode} h-10`} />
                                    </span>
                                    <span className='ml-4'>{c.name}</span>
                                </div>
                                <div className='flex justify-end'>
                                    <span className=''>{c._count.citizens || 0}</span>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Card.Content>
        </Card>
    )
}

export default TopCountries