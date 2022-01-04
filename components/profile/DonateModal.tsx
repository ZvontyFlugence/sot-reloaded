import { useUser } from '@/core/context/UserContext'
import { UserActions } from '@/core/enums'
import { IUser, IWalletInfo } from '@/core/interfaces'
import request from '@/core/request'
import refreshData from '@/core/uiHelpers/refreshData'
import showToast from '@/core/uiHelpers/showToast'
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import Select from '../shared/Select'

interface DonateModalProps {
    profile: IUser
    isOpen: boolean
    onClose: () => void
}

const walletInfoFetcher = (url: string) => request({ url, method: 'GET' })

const DonateModal: React.FC<DonateModalProps> = ({ profile, isOpen, onClose }) => {
    const router = useRouter()
    const toast = useToast()
    const user = useUser()

    const { mutate } = useSWRConfig()
    const { data: walletData } = useSWR('/api/me/wallet-info', walletInfoFetcher)

    const [walletInfo, setWalletInfo] = useState<IWalletInfo[]>([])
    const [gold, setGold] = useState<number>(0)
    const [balanceId, setBalanceId] = useState<number>(-1)
    const [amount, setAmount] = useState<number>(0)

    useEffect(() => {
        if (walletData?.walletInfo)
            setWalletInfo(walletData.walletInfo as IWalletInfo[])
    }, [walletData])

    const handleClose = () => {
        setGold(0)
        setBalanceId(-1)
        setAmount(0)
        onClose()
    }

    const handleDonate = () => {
        const body = {
            action: UserActions.DONATE,
            data: {
                profileId: profile.id,
                gold: gold > 0 ? gold : undefined,
                funds: balanceId > -1 && amount > 0 ? {
                    balanceId,
                    amount
                } : undefined
            }
        }

        request({
            url: '/api/me/doAction',
            method: 'POST',
            body,
        }).then(data => {
            if (data.success) {
                showToast(toast, 'success', 'Donation Successful', data?.message)
                mutate('/api/me/alerts')
                mutate('/api/me/wallet-info')
                refreshData(router)
                handleClose()
            } else {
                showToast(toast, 'error', 'Donation Failed', data?.error)
            }
        })
    }

    const getCCMax: () => number = () => {
        if (balanceId < 0)
            return 0

        let cc = walletInfo.find(cc => cc.id === balanceId)
        return cc?.amount ?? 0
    }

    const getCCName: () => string = () => {
        if (balanceId < 0)
            return ''

        let cc = walletInfo.find(cc => cc.id === balanceId)
        return cc?.currency.code ?? ''
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalOverlay />
            <ModalContent bgColor='night.400' color='snow.100'>
                <ModalHeader className='text-aurora-red'>Donate Funds</ModalHeader>
                <ModalCloseButton />
                <ModalBody className='flex flex-col text-center gap-2'>
                    {balanceId > -1 && amount > 0 && gold > 0 ? (
                        <p>
                            Donate {gold.toFixed(2)} Gold and {amount.toFixed(2)} {getCCName()}?
                        </p>
                    ) : balanceId > -1 && amount > 0 ? (
                        <p>
                            Donate {amount.toFixed(2)} {getCCName()}?
                        </p>
                    ) : gold > 0 && (
                        <p>
                            Donate {gold.toFixed(2)} Gold?
                        </p>
                    )}
                    <FormControl>
                        <FormLabel>Gold</FormLabel>
                        <Input type='number' min={0} max={Number.parseFloat(user?.gold.toString() ?? '0')} step={0.01} value={gold.toFixed(2)} onChange={e => setGold(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Currency</FormLabel>
                        <Select className='border border-white rounded' selected={balanceId} onChange={val => setBalanceId(val)}>
                            {([null] as (IWalletInfo | null)[]).concat(walletInfo).map((wi, i) => (
                                <Select.Option key={i} value={wi ? wi.id : -1} disabled={!wi}>
                                    {wi ? wi.currency.code : 'Select Currency'}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormControl>
                    {balanceId > -1 && (
                        <FormControl>
                            <FormLabel>Currency Amount</FormLabel>
                            <Input type='number' min={0} max={getCCMax()} step={0.01} value={amount.toFixed(2)} onChange={e => setAmount(e.target.valueAsNumber)} />
                        </FormControl>
                    )}
                </ModalBody>
                <ModalFooter className='flex gap-4'>
                    <Button
                        variant='solid'
                        size='sm'
                        colorScheme=''
                        bgColor='aurora.green'
                        color='snow.100'
                        isDisabled={amount === 0 && gold === 0}
                        onClick={handleDonate}
                    >
                        Donate Funds
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
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
    )
}

export default DonateModal
