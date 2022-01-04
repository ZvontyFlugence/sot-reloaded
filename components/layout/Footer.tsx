import { HStack } from '@chakra-ui/layout'

const Footer: React.FC = () => {
    return (
        <HStack className='text-xs' justifyContent='space-between'>
            <span>&copy; 2021 State of Turmoil</span>
            <HStack spacing={6} divider={<Divider />}>
                <span className='cursor-pointer'>Terms of Service</span>
                <span className='cursor-pointer'>Privacy Policy</span>
                <span className='cursor-pointer'>Contact Us</span>
            </HStack>
        </HStack>
    )
}

const Divider: React.FC = () => <span className='mx-4'>|</span>

export default Footer