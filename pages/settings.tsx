import Layout from '@/components/layout/Layout'
import Select from '@/components/shared/Select'
import { useUser } from '@/core/context/UserContext'
import { UserActions } from '@/core/enums'
import withPrisma from '@/core/prismaClient'
import request from '@/core/request'
import showToast from '@/core/uiHelpers/showToast'
import { Button, FormControl, FormLabel, Heading, Input, Textarea, useToast } from '@chakra-ui/react'
import { PrismaClient, Region } from '@prisma/client'
import type { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react'
import { ChangeEvent, MouseEvent, useState } from 'react'
import { useSWRConfig } from 'swr'
import { useColorModeValue } from '@chakra-ui/system'

interface SettingsProps {
	regions: Region[]
}

const Settings: NextPage<SettingsProps> = ({ regions }) => {
	const toast = useToast()
	const user = useUser()
	const { mutate } = useSWRConfig()

	const [file, setFile] = useState<File>()
	const [username, setUsername] = useState<string>(user?.username ?? '')
	const [newPw, setNewPw] = useState<string>('')
	const [currPw, setCurrPw] = useState<string>('')
	const [selectedRegion, setSelectedRegion] = useState<number>(-1)
	const [desc, setDesc] = useState<string>(user?.description ?? '')

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length !== 1) return

		const targetFile = e.target.files[0]
		setFile(targetFile)
	}

	const handleUpload = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		if (!file) return

		const formData = new FormData()
		formData.append('image', file)

		request({
			url: '/api/me/upload',
			method: 'POST',
			body: formData,
		}).then((data) => {
			if (data.success) showToast(toast, 'success', 'Image Uploaded', data?.message)
			else showToast(toast, 'error', 'Image Upload Failed', data?.error)
		})
	}

	const handleUpdateUsername = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		request({
			url: '/api/me/update-settings',
			method: 'POST',
			body: { username },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Description Updated', data?.message)
				setDesc('')
			} else showToast(toast, 'error', 'Update Description Failed', data?.error)
		})
	}

	const handleUpdateDesc = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		request({
			url: '/api/me/update-settings',
			method: 'POST',
			body: { description: desc },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Description Updated', data?.message)
				setDesc('')
			} else showToast(toast, 'error', 'Update Description Failed', data?.error)
		})
	}

	const handleTravel = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body: { action: UserActions.TRAVEL, data: { regionId: selectedRegion } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Traveled To Region', data?.message)
				mutate('/api/me/location-info')
				setSelectedRegion(-1)
			} else {
				showToast(toast, 'error', 'Travel Failed', data?.error)
			}
		})
	}

	const handleMoveResidence = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		request({
			url: '/api/me/doAction',
			method: 'POST',
			body: { action: UserActions.MOVE_RESIDENCE, data: { regionId: selectedRegion } },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Residence Moved', data?.message)
				setSelectedRegion(-1)
			} else {
				showToast(toast, 'error', 'Move Residence Failed', data?.error)
			}
		})
	}

	const handleUpdatePw = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		request({
			url: '/api/me/update-pass',
			method: 'POST',
			body: { currPw, newPw },
		}).then((data) => {
			if (data.success) {
				showToast(toast, 'success', 'Password Updated', data?.message)
				setCurrPw('')
				setNewPw('')
			} else {
				showToast(toast, 'error', 'Update Password Failed', data?.error)
			}
		})
	}

	return (
		<Layout>
			<div className='flex flex-col w-full'>
				<div className={`p-4 md:px-12 ${useColorModeValue('bg-snow-300', 'bg-night-400')} rounded-md`}>
					<Heading color='aurora.red' className='text-2xl font-semibold text-center'>
						Settings
					</Heading>
					<div className='flex flex-col gap-2'>
						<div className='flex items-center justify-between gap-2'>
							<FormControl>
								<FormLabel className='text-xl'>Travel</FormLabel>
								<Select
									className={`relative border ${useColorModeValue(
										'border-night-300',
										'border-snow-100'
									)} border-opacity-25 rounded shadow-md`}
									selected={selectedRegion}
									onChange={(val) => setSelectedRegion(val)}
								>
									{([null] as (Region | null)[]).concat(regions).map((r, i) => (
										<Select.Option key={i} value={r ? r.id : -1} disabled={!r}>
											{r ? r.name : 'Select Region'}
										</Select.Option>
									))}
								</Select>
								<Button className='mt-2' variant='outline' color='frost.100' colorScheme='' onClick={handleTravel}>
									Update
								</Button>
							</FormControl>
							<FormControl>
								<FormLabel className='text-xl'>Move Residence</FormLabel>
								<Select
									className={`relative border ${useColorModeValue(
										'border-night-300',
										'border-snow-100'
									)} border-opacity-25 rounded shadow-md`}
									selected={selectedRegion}
									onChange={(val) => setSelectedRegion(val)}
								>
									{([null] as (Region | null)[])
										.concat(regions.filter((r) => r.ownerId === user?.countryId))
										.map((r, i) => (
											<Select.Option key={i} value={r ? r.id : -1} disabled={!r}>
												{r ? r.name : 'Select Region'}
											</Select.Option>
										))}
								</Select>
								<Button
									className='mt-2'
									variant='outline'
									color='frost.100'
									colorScheme=''
									onClick={handleMoveResidence}
								>
									Update
								</Button>
							</FormControl>
						</div>
						<FormControl>
							<FormLabel className='text-xl'>Update Profile Picture</FormLabel>
							<Input
								borderColor={useColorModeValue('night.300', 'snow.100')}
								type='file'
								accept='image/*'
								onChange={handleFileChange}
							/>
							<Button className='mt-2' variant='outline' color='frost.100' colorScheme='' onClick={handleUpload}>
								Upload
							</Button>
						</FormControl>
						<FormControl>
							<FormLabel className='text-xl'>Update Description</FormLabel>
							<Textarea
								borderColor={useColorModeValue('night.300', 'snow.100')}
								value={desc}
								onChange={(e) => setDesc(e.target.value)}
							/>
							<Button className='mt-2' variant='outline' color='frost.100' colorScheme='' onClick={handleUpdateDesc}>
								Update
							</Button>
						</FormControl>
						<FormControl>
							<FormLabel className='text-xl'>Update Username</FormLabel>
							<Input
								borderColor={useColorModeValue('night.300', 'snow.100')}
								type='text'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
							<Button
								className='mt-2'
								variant='outline'
								color='aurora.red'
								colorScheme=''
								onClick={handleUpdateUsername}
							>
								Update
							</Button>
						</FormControl>
						<FormControl>
							<FormLabel className='text-xl'>Update Password</FormLabel>
							<div className='flex md:flex-row flex-col md:justify-between gap-2'>
								<Input
									borderColor={useColorModeValue('night.300', 'snow.100')}
									type='password'
									placeholder='New Password'
									value={newPw}
									onChange={(e) => setNewPw(e.target.value)}
								/>
								<Input
									borderColor={useColorModeValue('night.300', 'snow.100')}
									type='password'
									placeholder='Current Password'
									value={currPw}
									onChange={(e) => setCurrPw(e.target.value)}
								/>
							</div>
							<Button className='mt-2' variant='outline' color='aurora.red' colorScheme='' onClick={handleUpdatePw}>
								Update
							</Button>
						</FormControl>
					</div>
				</div>
			</div>
		</Layout>
	)
}

export default Settings

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (!session || !session.user.id)
		return {
			redirect: { destination: '/', permanent: false },
		}

	let regions = await withPrisma(async (client: PrismaClient) => {
		return await client.region.findMany({ orderBy: { name: 'asc' } })
	})

	return { props: { regions } }
}
