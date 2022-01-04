import { Avatar } from '@chakra-ui/avatar'
import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay } from '@chakra-ui/modal'
import { Spinner } from '@chakra-ui/spinner'
import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/tag'
import { Textarea } from '@chakra-ui/textarea'
import { useToast } from '@chakra-ui/toast'
import { FocusableElement } from '@chakra-ui/utils'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { useUser } from '../../core/context/UserContext'
import request from '../../core/request'
import showToast from '../../core/uiHelpers/showToast'

interface ComposeMailProps {
    profile?: Participant
    isOpen: boolean
    onClose: () => void
}

interface Participant {
    id: number
    username: string
    image: string
}

const ComposeMail: React.FC<ComposeMailProps> = ({ isOpen, onClose, profile }) => {
    const toast = useToast()
    const user = useUser()
    const cancelRef = useRef<FocusableElement | null>(null)

    const [participant, setParticipant] = useState<string>('')
    const [users, setUsers] = useState<Participant[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [results, setResults] = useState<Participant[]>([])
    const [subject, setSubject] = useState<string>('')
    const [message, setMessage] = useState<string>('')

    useEffect(() => {
        if (profile)
            setUsers(curr => [...curr, profile])
    }, [profile])

    // TODO: Implement Search User Query w/ SWR

    const removeUser = (userId: number) => {
        setUsers(prev => prev.filter(u => u.id !== userId))
    }

    const handleSearch = (e: SyntheticEvent) => {
        let username = (e.target as HTMLInputElement).value
        setParticipant(username)
        setLoading(true)

        request({
            url: '/api/users',
            method: 'GET'
        }).then(data => {
            if (data?.users) {
                setResults(data.users.filter((u: Participant) => {
                    return u.username.includes(username) && u.id !== user?.id
                        && !users.find(usr => usr.username.includes(username))
                }))
            }

            setLoading(false)
        })
    }

    const handleSelection = (user: Participant) => {
        setUsers(prev => [...prev, user])
        setResults([])
        setParticipant('')
    }

    const handleCreateMsgThread = () => {
        request({
            url: '/api/mail/create',
            method: 'POST',
            body: {
                participants: users.map(u => u.id),
                subject,
                content: message,
            },
        }).then(data => {
            if (data.success) {
                showToast(toast, 'success', 'Message Sent', data?.message)
                handleClose()
            } else {
                showToast(toast, 'error', 'Send Message Failed', data?.error)
            }
        })
    }

    const resultItem = (result: Participant) => (
        <div key={result.id} className='flex items-center gap-2 py-2 px-4 cursor-pointer rounded hover:bg-frost-100' onClick={() => handleSelection(result)}>
            <div className='flex'>
                <Avatar size='sm' src={result.image} name={result.username} />
            </div>
            <div>{result.username}</div>
        </div>
    )

    const handleClose = () => {
        // Clear State
        setParticipant('')
        setUsers([])
        setLoading(false)
        setResults([])
        setSubject('')
        setMessage('')

        // Close Dialog
        onClose()
    }

    return (
        <AlertDialog
            motionPreset='slideInBottom'
            leastDestructiveRef={cancelRef}
            onClose={handleClose}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay />
            <AlertDialogContent bgColor='night.400' color='snow.100'>
                <AlertDialogHeader className='text-aurora-red'>Compose New Message</AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody className='flex flex-col gap-2'>
                    <div className='relative w-max'>
                        <Input className='border border-snow-100 border-opacity-25 shadow-md rounded' type='text' value={participant} onChange={handleSearch} />
                        {participant.length > 0 && (
                            <div className={`absolute top-12 left-0 bg-night-300 py-2 px-4 rounded shadow-md w-full`}>
                                {loading ? (
                                    <Spinner size='lg' color='aurora.red' />
                                ) : results.length === 0 ? (
                                    <span>No Users Found</span>
                                ) : results.map((result) => resultItem(result))}
                            </div>
                        )}
                    </div>

                    <div className='my-2'>
                        <span>To: </span>
                        {users.map((u) => (
                            <Tag key={u.id} size='lg' colorScheme='whiteAlpha' borderRadius='full'>
                                <Avatar src={u.image} size='xs' name={u.username} ml={-1} mr={2} />
                                <TagLabel>{u.username}</TagLabel>
                                <TagCloseButton onClick={() => removeUser(u.id)} />
                            </Tag>
                        ))}
                    </div>
                    <FormControl>
                        <FormLabel>Subject</FormLabel>
                        <Input type='text' value={subject} onChange={e => setSubject(e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Message</FormLabel>
                        <Textarea placeholder='Enter Message' value={message} onChange={e => setMessage(e.target.value)} />
                    </FormControl>
                </AlertDialogBody>
                <AlertDialogFooter className='flex gap-4'>
                    <Button
                        variant='solid'
                        colorScheme=''
                        bgColor='aurora.green'
                        color='snow.100'
                        onClick={handleCreateMsgThread}
                    >
                        Send
                    </Button>
                    <Button
                        variant='outline'
                        colorScheme=''
                        color='snow.100'
                        _hover={{ bg: 'snow.100', color: 'night.400' }}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ComposeMail