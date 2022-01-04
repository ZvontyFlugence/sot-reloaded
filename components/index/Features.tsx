import { List, ListItem, Text } from '@chakra-ui/layout'
import Card from '../shared/Card'

const Features: React.FC = () => {
    return (
        <Card>
            <Card.Header className='text-xl text-center font-bold mb-4 text-white'>
                <Text color='aurora.red.500'>Features</Text>
            </Card.Header>
            <Card.Content className='text-white'>
                <List spacing={3}>
                    <ListItem>
                        <Text color='frost.100' className='text-lg font-semibold'>Player-Ran Simulation</Text>
                        Everything in State of Turmoil is controlled by the players.
                        Here, the players have all the power and control not only their own destinies but the fate of the world itself!
                    </ListItem>
                    <ListItem>
                        <Text color='frost.100' className='text-lg font-semibold'>In-Depth Mechanics</Text>
                        State of Turmoil has a variety of unique mechanics and features to set it apart from similar games.
                        We pride ourselves on our attention to detail and depth of our features to truly make a great simulation of the world.
                    </ListItem>
                    <ListItem>
                        <Text color='frost.100' className='text-lg font-semibold'>Caters to All Play Styles</Text>
                        Every player is a unique individual and has their own gameplay preferences and styles.
                        So whether you want to be an author of a popular newspaper, run a wealthy business tycoon,
                        be a prominent politician, a patriotic soldier, or ruthless mercenary -- we have something for all players to enjoy!
                    </ListItem>
                </List>
            </Card.Content>
        </Card>
    )
}

export default Features
