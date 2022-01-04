import { Avatar } from '@chakra-ui/avatar'
import { Tag, TagLabel } from '@chakra-ui/tag'
import { useToast } from '@chakra-ui/toast'
import formatDistance from 'date-fns/formatDistance'
import { useRouter } from 'next/router'
import { MouseEvent } from 'react'
import { Item, Menu, useContextMenu } from 'react-contexify'
import { useUser } from '../../core/context/UserContext'
import { IMsgThread } from '../../core/interfaces'
import request from '../../core/request'

interface MailItemProps {
    thread: IMsgThread
}

const MailItem: React.FC<MailItemProps> = ({ thread }) => {
    const router = useRouter()
    const toast = useToast()
    const user = useUser()

    const { show } = useContextMenu({ id: `thread-${thread.id}` })

    const getTimestamp = () => (
        <span>
            {formatDistance(new Date(thread.timestamp), new Date(Date.now()), { addSuffix: true })}
        </span>
    )

    const goToThread = () => {
        router.push(`/mail/thread/${thread.id}`)
    }

    const handleRead = () => {}

    const handleDelete = () => {}

    const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        show(event)
    }

    return (
        <>
            <div
                className={`flex py-2 px-4 alert-item border-solid border-black border-opacity-25 ${thread.read ? 'bg-night-200 bg-opacity-25' : ''}`}
                onContextMenu={handleContextMenu}
            >
                <div
                    className={`flex justify-between items-center gap-4 py-1 cursor-pointer w-full text-snow-100 ${thread.read ? '' : 'font-semibold'}`}
                    onClick={goToThread}
                >
                    <div className='px-2'>
                        <Tag
                            className='flex-grow-0'
                            size='sm'
                            variant={thread.read ? 'outline' : 'solid'}
                            borderRadius='full'
                            bgColor={thread.read ? undefined : 'frost.100'}
                        />
                    </div>
                    <div className='flex flex-col flex-grow gap-0.5'>
                        <span className='font-semibold'>{thread.subject}</span>
                        {thread.participants.filter(u => u.id !== user?.id).map((user) => (
                            <Tag key={user.id} size='lg' colorScheme='whiteAlpha' borderRadius='full'>
                                <Avatar src={user.image} size='xs' name={user.username} ml={-1} mr={2} />
                                <TagLabel>{user.username}</TagLabel>
                            </Tag>
                        ))}
                        <div className='overflow-hidden overflow-ellipsis whitespace-nowrap' style={{ fontWeight: thread.read ? 'lighter' : 'bold' }}>
                            {thread.messages[thread.messages.length - 1].content}
                        </div>
                    </div>
                    <div className='px-4'>{getTimestamp()}</div>
                </div>
            </div>

            <Menu id={`thread-${thread.id}`} theme='brand'>
                <Item onClick={handleRead} disabled={thread.read}>Mark as Read</Item>
                <Item onClick={handleDelete}>Delete</Item>
            </Menu>
        </>
    )
}

export default MailItem