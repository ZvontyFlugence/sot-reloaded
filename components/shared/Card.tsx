import { Box } from '@chakra-ui/layout'

interface CardSection {
    className?: string
    onClick?: () => void,

}

interface CardComponent {
    Header: React.FC<CardSection>
    Content: React.FC<CardSection>
    Footer: React.FC<CardSection>
}

const Card: React.FC & CardComponent = ({ children }) => {
    return (
        <Box bg='night.400' className='w-full p-4 shadow-md rounded'>
            {children}
        </Box>
    )
}

const Header: React.FC<CardSection> = ({ children, ...props }) => (<div {...props}>{children}</div>)
Card.Header = Header

const Content: React.FC<CardSection> = ({ children, ...props }) => (<div {...props}>{children}</div>)
Card.Content = Content

const Footer: React.FC<CardSection> = ({ children, ...props }) => (<div {...props}>{children}</div>)
Card.Footer = Footer

export default Card
