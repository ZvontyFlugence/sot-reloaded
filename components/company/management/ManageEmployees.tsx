import { CompanyActions } from '@/core/enums'
import { IJobRecord } from '@/core/interfaces'
import request from '@/core/request'
import showToast from '@/core/uiHelpers/showToast'
import {
	Avatar,
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
	Table,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
	useToast,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ManageEmployeesProps {
	compId: number
	currency: string
	employees: IJobRecord[]
}

const ManageEmployees: React.FC<ManageEmployeesProps> = ({ compId, currency, employees }) => {
	const router = useRouter()
	const toast = useToast()

	const [selected, setSelected] = useState<IJobRecord | null>(null)
	const [title, setTitle] = useState<string>('')
	const [wage, setWage] = useState<number>(0)

	const { isOpen: isEditOpen, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
	const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()

	useEffect(() => {
		if (selected) {
			setTitle(selected.title)
			setWage(Number.parseInt(selected.wage.toString()))
		} else {
			setTitle('')
			setWage(0)
		}
	}, [selected])

	const handleOpenEdit = (employee: IJobRecord) => {
		setSelected(employee)
		onOpenEdit()
	}

	const handleOpenDelete = (employee: IJobRecord) => {
		setSelected(employee)
		onOpenDelete()
	}

	const handleClose = () => {
		setSelected(null)
		if (isEditOpen) onCloseEdit()
		else onCloseDelete()
	}

	const handleEdit = () => {
		if (!selected) return

		request({
			url: '/api/companies/doAction',
			method: 'POST',
			body: {
				action: CompanyActions.EDIT_EMPLOYEE,
				data: {
					compId,
					employee: {
						userId: selected.userId,
						title: title !== selected.title && title !== '' ? title : undefined,
						wage: wage > 0 && wage !== Number.parseFloat(selected.wage) ? wage : undefined,
					},
				},
			},
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Employee Updated', data?.message)
				handleClose()
			} else {
				showToast(toast, 'error', 'Edit Employee Failed', data?.error)
			}
		})
	}

	const handleFire = () => {
		if (!selected) return

		request({
			url: '/api/companies/doAction',
			method: 'DELETE',
			body: { action: CompanyActions.FIRE_EMPLOYEE, data: { compId, employeeId: selected.id } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Employee Fired', data?.message)
				handleClose()
			} else {
				showToast(toast, 'error', 'Fire Employee Failed', data?.error)
			}
		})
	}

	const canEdit = () => {
		if (!title && wage === 0) return false
		else if (selected && title === selected.title && wage === Number.parseInt(selected.wage.toString())) return false

		return true
	}

	return (
		<div className='flex'>
			{employees.length === 0 ? (
				<p>Company doesn't have any employees</p>
			) : (
				<>
					<div className='hidden md:block'>
						<Table variant='unstyled'>
							<Thead>
								<Tr>
									<Th color='snow.100'>Employee</Th>
									<Th color='snow.100'>Title</Th>
									<Th color='snow.100'>Wage</Th>
									<Th color='snow.100'>Actions</Th>
								</Tr>
							</Thead>
							<Tbody>
								{employees.map((emp: IJobRecord, i: number) => (
									<Tr key={i}>
										<Td className='flex items-center gap-2 link' onClick={() => router.push(`/profile/${emp.userId}`)}>
											<Avatar src={emp.user?.image} name={emp.user?.username} />
											{emp.user?.username}
										</Td>
										<Td>{emp.title}</Td>
										<Td>
											{Number.parseFloat(emp.wage).toFixed(2)} {currency}
										</Td>
										<Td className='flex items-center gap-4'>
											<Button variant='solid' bgColor='frost.400' color='snow.100' onClick={() => handleOpenEdit(emp)}>
												Edit
											</Button>
											<Button
												variant='solid'
												bgColor='aurora.red'
												color='snow.100'
												onClick={() => handleOpenDelete(emp)}
											>
												Delete
											</Button>
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</div>
					<div className='flex md:hidden flex-col items-center gap-4 w-full'>
						<h3 className='text-xl font-semibold text-aurora-red'>Employees</h3>
						{employees.map((emp: IJobRecord, i: number) => (
							<div key={i} className='flex items-center gap-2 w-full'>
								<div onClick={() => router.push(`/profile/${emp.userId}`)}>
									<Avatar src={emp.user?.image} name={emp.user?.username} />
								</div>
								<div className='flex flex-col gap-2 flex-grow'>
									<span className='text-base link' onClick={() => router.push(`/profile/${emp.userId}`)}>
										{emp.user?.username}
									</span>
									<span className='ml-2'>{emp.title}</span>
									<span className='ml-2'>
										Wage: {Number.parseFloat(emp.wage).toFixed(2)} {currency}
									</span>
								</div>
								<div className='flex flex-col items-center gap-2'>
									<Button
										size='sm'
										bgColor='frost.400'
										color='snow.100'
										colorScheme=''
										onClick={() => handleOpenEdit(emp)}
									>
										Edit
									</Button>
									<Button
										size='sm'
										bgColor='aurora.red'
										color='snow.100'
										colorScheme=''
										onClick={() => handleOpenDelete(emp)}
									>
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				</>
			)}

			{/* Edit Employee Modal */}
			<Modal isOpen={isEditOpen} onClose={handleClose}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-xl font-semibold text-aurora-red'>Edit Employee</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						<FormControl>
							<FormLabel>Title</FormLabel>
							<Input type='text' defaultValue={selected?.title} onChange={(e) => setTitle(e.target.value)} />
						</FormControl>
						<FormControl>
							<FormLabel>Wage</FormLabel>
							<Input
								type='number'
								defaultValue={selected?.wage}
								min={0.01}
								step={0.01}
								onChange={(e) => setWage(e.target.valueAsNumber)}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button
							variant='solid'
							bgColor='frost.400'
							color='snow.100'
							colorScheme=''
							onClick={handleEdit}
							isDisabled={!canEdit()}
						>
							Edit
						</Button>
						<Button variant='outline' _hover={{ bg: 'snow.100', color: 'night.400' }} onClick={handleClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Delete Employee Modal */}
			<Modal isOpen={isDeleteOpen} onClose={handleClose}>
				<ModalOverlay />
				<ModalContent bgColor='night.400' color='snow.100'>
					<ModalHeader className='text-xl font-semibold text-aurora-red'>Fire Employee</ModalHeader>
					<ModalCloseButton />
					<ModalBody className='flex flex-col gap-2'>
						<p>Are you sure you want to fire this employee?</p>
					</ModalBody>
					<ModalFooter className='flex gap-4'>
						<Button variant='solid' bgColor='aurora.red' color='snow.100' colorScheme='' onClick={handleFire}>
							Fire
						</Button>
						<Button variant='outline' _hover={{ bg: 'snow.100', color: 'night.400' }} onClick={handleClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	)
}

export default ManageEmployees
