import Select from '@/components/shared/Select'
import { useUser } from '@/core/context/UserContext'
import request from '@/core/request'
import convertDecimal from '@/core/uiHelpers/convertDecimal'
import showToast from '@/core/uiHelpers/showToast'
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stat,
	StatGroup,
	StatLabel,
	StatNumber,
	useDisclosure,
	useToast
} from '@chakra-ui/react'
import { FundsBalance, WalletBalance } from '@prisma/client'
import { useState } from 'react'
import { useSWRConfig } from 'swr'

interface ManageTreasuryProps {
	compId: number
	funds: FundsBalance[]
	wallet: WalletBalance[]
	gold: number
	currencyCode: string
}

const ManageTreasury: React.FC<ManageTreasuryProps> = ({ compId, currencyCode, funds, gold, wallet }) => {
	const toast = useToast()
	const user = useUser()
	const { mutate } = useSWRConfig()

	const defaultFunds = funds.find(f => f.currencyId === currencyCode)

	const [transGold, setTransGold] = useState<number>(0.0)
	const [currency, setCurrency] = useState<number>(-1)
	const [amount, setAmount] = useState<number>(0.0)

	const { isOpen: isDepositOpen, onOpen: onOpenDeposit, onClose: onCloseDeposit } = useDisclosure()
	const { isOpen: isWithdrawOpen, onOpen: onOpenWithdraw, onClose: onCloseWithdraw } = useDisclosure()

	const handleDeposit = () => {
		const userFunds = wallet.find(wi => wi.currencyId === currency)

		const payload = {
			compId,
			gold: transGold > 0 ? transGold : undefined,
			funds: currency > -1 && amount > 0 ? { currency: userFunds?.currencyId, amount } : undefined
		}

		request({
			url: '/api/companies/funds/deposit',
			method: 'POST',
			body: payload
		}).then(data => {
			if (data.success) {
				showToast(toast, 'success', 'Deposit Successful', data?.message)
				mutate('/api/me/wallet-info')
			} else {
				showToast(toast, 'error', 'Deposit Failed', data?.error)
			}
		})

		setCurrency(-1)
		setAmount(0)
		setTransGold(0)
		onCloseDeposit()
	}

	const handleWithdraw = () => {
		const payload = {
			compId,
			gold: transGold > 0 ? transGold : undefined,
			funds: currency > -1 && amount > 0 ? { currency: funds[currency]?.currencyId, amount } : undefined
		}

		request({
			url: '/api/companies/funds/withdraw',
			method: 'POST',
			body: payload
		}).then(data => {
			if (data.success) {
				showToast(toast, 'success', 'Withdrawal Successful', data?.message)
				mutate('/api/me/wallet-info')
			} else {
				showToast(toast, 'error', 'Withdrawal Failed', data?.error)
			}
		})

		setCurrency(-1)
		setAmount(0)
		setTransGold(0)
		onCloseWithdraw()
	}

	return (
		<div className='flex flex-col'>
			<div className='flex justify-end gap-4'>
				<Button size='sm' variant='solid' bgColor='aurora.green' color='snow.100' onClick={onOpenDeposit}>
					Deposit
				</Button>
				<Button size='sm' variant='solid' bgColor='frost.400' color='snow.100' onClick={onOpenWithdraw}>
					Withdraw
				</Button>
			</div>
			<div className='flex w-full justify-center items-center'>
				<StatGroup className='flex justify-center gap-8 w-1/2'>
					<Stat>
						<StatLabel>Gold</StatLabel>
						<StatNumber>
							<span className='mr-2'>{gold.toFixed(2)}</span>
							<i className='sot-icon sot-coin' title='Gold' />
						</StatNumber>
					</Stat>
					<Stat>
						<StatLabel>{currencyCode}</StatLabel>
						<StatNumber>
							<div className='flex items-center gap-2'>
								<span>{(defaultFunds && convertDecimal(defaultFunds.amount).toFixed(2)) || 0.0}</span>
								<span className='sot-flag-wrap'>
									<i className={`sot-flag sot-flag-usa h-10`} />
								</span>
							</div>
						</StatNumber>
					</Stat>
				</StatGroup>
			</div>

			{/* Deposit Funds Modal */}
			<Modal isOpen={isDepositOpen} onClose={onCloseDeposit}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-xl font-semibold text-aurora-red'>Deposit Funds</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						{currency > -1 && amount > 0 && transGold > 0 ? (
							<p>
								Deposit {transGold.toFixed(2)} Gold and {amount.toFixed(2)}{' '}
								{funds[currency]?.currencyId}?
							</p>
						) : currency > -1 && amount > 0 ? (
							<p>
								Deposit {amount.toFixed(2)} {currency}?
							</p>
						) : (
							transGold > 0 && <p>Deposit {transGold.toFixed(2)} Gold?</p>
						)}
						<FormControl>
							<FormLabel>Gold</FormLabel>
							<Input
								type='number'
								min={1}
								max={convertDecimal(user?.gold)}
								step={0.01}
								value={transGold.toFixed(2)}
								onChange={e => setTransGold(e.target.valueAsNumber)}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Currency</FormLabel>
							<Select
								className='relative border border-white border-opacity-25 rounded'
								selected={currency}
								onChange={val => setCurrency(val)}
							>
								{([null] as (FundsBalance | null)[])
									.concat(funds)
									.map((cc: FundsBalance | null, i: number) => (
										<Select.Option key={i} value={i - 1} disabled={!cc}>
											{cc ? cc.currencyId : 'Select Currency'}
										</Select.Option>
									))}
							</Select>
						</FormControl>
						{currency > -1 && (
							<FormControl>
								<FormLabel>Currency Amount</FormLabel>
								<Input
									type='number'
									min={0}
									max={convertDecimal(funds[currency]?.amount)}
									step={0.01}
									value={amount.toFixed(2)}
									onChange={e => setAmount(e.target.valueAsNumber)}
								/>
							</FormControl>
						)}
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button
							variant='solid'
							bgColor='aurora.green'
							color='snow.100'
							colorScheme=''
							isDisabled={amount === 0 && transGold === 0}
							onClick={handleDeposit}
						>
							Deposit Funds
						</Button>
						<Button
							variant='outline'
							_hover={{ bg: 'snow.100', color: 'night.400' }}
							onClick={onCloseDeposit}
						>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Withdraw Funds Modal */}
			<Modal isOpen={isWithdrawOpen} onClose={onCloseWithdraw}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-xl font-semibold text-aurora-red'>Withdraw Funds</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						{currency > -1 && amount > 0 && transGold > 0 ? (
							<p>
								Withdraw {transGold.toFixed(2)} Gold and {amount.toFixed(2)}{' '}
								{funds[currency]?.currencyId}?
							</p>
						) : currency > -1 && amount > 0 ? (
							<p>
								Withdraw {amount.toFixed(2)} {funds[currency]?.currencyId}?
							</p>
						) : (
							transGold > 0 && <p>Withdraw {transGold.toFixed(2)} Gold?</p>
						)}
						<FormControl>
							<FormLabel>Gold</FormLabel>
							<Input
								type='number'
								min={0}
								max={gold}
								step={0.01}
								value={transGold.toFixed(2)}
								onChange={e => setTransGold(e.target.valueAsNumber)}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Currency</FormLabel>
							{/* TODO: Fix Select Component Not Updating Selected Value Displayed */}
							<Select
								className='border border-white rounded'
								selected={currency}
								onChange={val => setCurrency(val as number)}
							>
								{([null] as (FundsBalance | null)[])
									.concat(funds)
									.map((cc: FundsBalance | null, i: number) => (
										<Select.Option key={i} value={i - 1} disabled={!cc}>
											{cc ? cc.currencyId : 'Select Currency'}
										</Select.Option>
									))}
							</Select>
						</FormControl>
						{currency > -1 && (
							<FormControl>
								<FormLabel>Currency Amount</FormLabel>
								<Input
									type='number'
									min={0}
									max={convertDecimal(funds[currency]?.amount)}
									step={0.01}
									value={amount.toFixed(2)}
									onChange={e => setAmount(e.target.valueAsNumber)}
								/>
							</FormControl>
						)}
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button
							variant='solid'
							bgColor='frost.400'
							color='snow.100'
							colorScheme=''
							isDisabled={amount === 0 && transGold === 0}
							onClick={handleWithdraw}
						>
							Withdraw Funds
						</Button>
						<Button
							variant='outline'
							_hover={{ bg: 'snow.100', color: 'night.400' }}
							onClick={onCloseWithdraw}
						>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	)
}

export default ManageTreasury
