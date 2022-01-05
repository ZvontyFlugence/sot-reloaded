import Select from '@/components/shared/Select'
import { CompanyActions } from '@/core/enums'
import { ICompany, IRegion } from '@/core/interfaces'
import request from '@/core/request'
import refreshData from '@/core/uiHelpers/refreshData'
import showToast from '@/core/uiHelpers/showToast'
import { Button, FormControl, FormLabel, Input, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import useSWR from 'swr'

interface CompanySettingsProps {
	company: ICompany
}

const regionFetcher = (url: string) => request({ url, method: 'GET' })

const CompanySettings: React.FC<CompanySettingsProps> = ({ company }) => {
	const router = useRouter()
	const toast = useToast()

	const { data: regionData } = useSWR('/api/regions', regionFetcher)

	const [name, setName] = useState<string>('')
	const [region, setRegion] = useState<number>(-1)
	const [file, setFile] = useState<File | null>(null)
	const [regions, setRegions] = useState<IRegion[]>([])

	useEffect(() => {
		if (regionData?.regions)
			setRegions(regionData.regions.sort((r1: IRegion, r2: IRegion) => (r1.name < r2.name ? 1 : -1)))
	}, [regionData])

	const handleUpdateName = () => {
		request({
			url: '/api/companies/doAction',
			method: 'POST',
			body: { action: CompanyActions.REBRAND, data: { compId: company.id, name } }
		}).then(data => {
			if (data.success) {
				showToast(toast, 'success', 'Company Name Updated', data?.message)
				refreshData(router)
			} else showToast(toast, 'error', 'Update Company Name Failed', data?.error)
		})
	}

	const handleRelocate = () => {
		request({
			url: '/api/companies/doAction',
			method: 'POST',
			body: { action: CompanyActions.RELOCATE, data: { compId: company.id, regionId: region } }
		}).then(data => {
			if (data.success) {
				showToast(toast, 'success', 'Company Relocated', data?.message)
				refreshData(router)
			} else showToast(toast, 'error', 'Company Relocation Failed', data?.error)
		})
	}

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length !== 1) return

		let targetFile = e.target.files[0]
		setFile(targetFile)
	}

	const handleUpload = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		if (!file) return

		const formData = new FormData()
		formData.append('image', file)
		formData.append('compId', `${company.id}`)

		request({
			url: '/api/companies/upload',
			method: 'POST',
			body: formData
		}).then(data => {
			if (data.success) {
				showToast(toast, 'success', 'Company Logo Updated', data?.message)
				refreshData(router)
			} else showToast(toast, 'error', 'Update Company Logo Failed', data?.error)
		})
	}

	return (
		<div className='flex gap-8'>
			<div className='flex flex-col gap-6'>
				<FormControl>
					<FormLabel className='text-xl'>Update Company Name</FormLabel>
					<Input type='text' defaultValue={company.name} onChange={e => setName(e.target.value)} />
					<Button
						className='mt-2'
						variant='outline'
						color='frost.100'
						colorScheme=''
						onClick={handleUpdateName}
					>
						Update
					</Button>
				</FormControl>
				<FormControl>
					<FormLabel className='text-xl'>Relocate Company</FormLabel>
					<Select
						className='relative border border-white border-opacity-25 rounded shadow-md'
						selected={region}
						onChange={setRegion}
					>
						{regions &&
							([null] as (IRegion | null)[]).concat(regions).map((r: IRegion | null, i: number) => (
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
						onClick={handleRelocate}
					>
						Relocate
					</Button>
				</FormControl>
			</div>
			<div className='flex flex-col gap-6'>
				<FormControl>
					<FormLabel className='text-xl'>Update Profile Picture</FormLabel>
					<Input type='file' accept='image/*' onChange={handleFileChange} />
					<Button className='mt-2' variant='outline' color='frost.100' onClick={handleUpload}>
						Upload
					</Button>
				</FormControl>
			</div>
		</div>
	)
}

export default CompanySettings
