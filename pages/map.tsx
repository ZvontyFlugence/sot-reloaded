/*global google*/
import React, { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Country, Prisma, PrismaClient, Region, RegionGeom, RegionNeighbor, RegionPath } from '@prisma/client'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import withPrisma from '@/core/prismaClient'
import { Button, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { pSBC } from '@/core/uiHelpers/pSBC'
import { MAP_STYLE } from '@/core/constants'
import { GMap } from 'primereact/gmap'
import { getResource, getResourceColor } from '@/core/uiHelpers/resources'
import request from '@/core/request'

const regionWithMapInfo = Prisma.validator<Prisma.RegionArgs>()({
	include: {
		core: true,
		owner: true,
		borders: {
			include: {
				geom: true,
			},
		},
		neighbors: true,
	},
})

type RegionWithMapInfo = Prisma.RegionGetPayload<typeof regionWithMapInfo>

const DEFAULT_MAP_PROPS = {
	center: {
		lat: 37.72886323155891,
		lng: -97.86977002071538,
	},
	zoom: 4,
	disableDefaultUI: true,
	styles: MAP_STYLE,
}

const Map: React.FC = () => {
	const router = useRouter()
	const toast = useToast()
	const [mode, setMode] = useState<string>('political')
	const [overlays, setOverlays] = useState<any[]>([])
	const [regions, setRegions] = useState<RegionWithMapInfo[]>([])

	useEffect(() => {
		request({
			url: '/api/regions',
			method: 'POST',
			body: { core: true, owner: true, borders: { include: { geom: true } }, neighbors: true },
		}).then((data) => {
			if (data?.regions) setRegions(data.regions)
		})
	}, [])

	const displayRegionInfo = (region: RegionWithMapInfo) => {
		toast({
			position: 'top-right',
			status: 'info',
			title: (
				<span className='flex gap-2'>
					{region.name} ({region.id})
					<span className='ml-2 sot-flag-wrap'>
						<i className={`sot-flag sot-flag-${region.owner.flagCode} h-7`} />
					</span>
				</span>
			),
			description: (
				<div className='mx-auto'>
					<p className='flex justify-between'>
						<span>Core:</span>
						<span>
							{region.core.nick}
							<span className='ml-2 sot-flag-wrap'>
								<i className={`sot-flag sot-flag-${region.core.flagCode} h-7`} />
							</span>
						</span>
					</p>
					<p className='flex justify-between mt-2'>
						<span>Resources:</span>
						<span>{getResource(region.resource)}</span>
					</p>
				</div>
			),
			isClosable: false,
		})
	}

	const getRegionColor = (region: RegionWithMapInfo) => {
		switch (mode) {
			case 'battles':
				return '#ffffff'
			case 'resources':
				return getResourceColor(region.resource)
			case 'political':
			default:
				return region.owner.color
		}
	}

	useEffect(() => {
		if (mode && regions) {
			setOverlays(
				regions.map((region) => {
					let paths = region.borders.map(({ geom }: { geom: RegionPath[] }) => {
						return geom.map((path: RegionPath) => ({ lat: path.lng, lng: path.lat }))
					})
					let color = getRegionColor(region)

					//@ts-ignore
					let polygon = new google.maps.Polygon({ paths, strokeWeight: 1, fillColor: color, fillOpacity: 0.9 })

					polygon.addListener('click', () => router.push(`/region/${region.id}`))
					polygon.addListener('mouseover', () => {
						displayRegionInfo(region)
						polygon.setOptions({ fillColor: pSBC(0.3, color) })
					})
					polygon.addListener('mouseout', () => {
						toast.closeAll()
						polygon.setOptions({ fillColor: color })
					})

					return polygon
				})
			)
		}
	}, [mode, regions])

	return (
		<Layout>
			<div className='flex flex-col w-full'>
				<h2 className='text-2xl text-aurora-red font-semibold'>World Map</h2>
				<div className='my-2 flex justify-center md:justify-end gap-2'>
					<Button size='sm' colorScheme='' bgColor='frost.300' color='snow.100' onClick={() => setMode('political')}>
						Political
					</Button>
					<Button size='sm' colorScheme='' bgColor='aurora.green' color='snow.100' onClick={() => setMode('resources')}>
						Resources
					</Button>
					<Button size='sm' colorScheme='' bgColor='aurora.red' color='snow.100' onClick={() => setMode('battles')}>
						Battles
					</Button>
				</div>
				<div className='h-[38rem] w-full'>
					{regions && overlays && (
						<GMap overlays={overlays} options={DEFAULT_MAP_PROPS} style={{ width: 'auto', height: '38rem' }} />
					)}
				</div>
			</div>
		</Layout>
	)
}

export default Map

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })

	if (!session || !session.user.id) {
		return {
			redirect: { destination: '/login', permanent: false },
		}
	}

	return { props: {} }
}
