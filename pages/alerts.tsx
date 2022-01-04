import Layout from '../components/layout/Layout'
import { useUser } from '../core/context/UserContext'
import request from '../core/request'
import showToast from '../core/uiHelpers/showToast'
import { GetServerSideProps } from 'next'
import { Button } from '@chakra-ui/button'
import { useToast } from '@chakra-ui/toast'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Alert } from '.prisma/client'
import { getSession } from 'next-auth/react'
import AlertItem from '../components/sidebar-items/AlertItem'
import { useSWRConfig } from 'swr'

const alertsFetcher = (url: string) => request({ url, method: 'GET' })

const Alerts: React.FC = () => {
    const toast = useToast()
    const user = useUser()
    const { mutate } = useSWRConfig()

    const [alerts, setAlerts] = useState<Alert[]>([])
    const { data: alertData } = useSWR('/api/me/alerts', alertsFetcher)

    useEffect(() => {
        if (alertData?.alerts)
            setAlerts(alertData.alerts)
    }, [alertData])

    const mutateAlerts = (alertId?: number, remove: boolean = false) => {
        if (alertId) {
            let data: Alert[] = alerts
            if (remove) {
                data = data.filter(a => a.id !== alertId)
            } else {
                let alert = data.find(a => a.id === alertId)
                if (alert)
                    data = [...data.filter(a => a.id !== alertId), { ...alert, read: true }]
                else
                    return
            }

            mutate('/api/me/alerts', data, false)
        } else {
            mutate('/api/me/alerts')
        }
    }

    const handleReadAll = () => {
        (async () => {
            let values = await Promise.all(alerts.filter(a => !a.read).map(async (alert: Alert) => {
                return await request({
                    url: '/api/alerts/read',
                    method: 'POST',
                    body: { alertId: alert.id }
                })
            }))

            try {
                if (!values.every(res => res.success)) {
                    let index = values.findIndex(res => !res.success && res?.error)
                    throw new Error(index >= 0 ? values[index].error : 'Unknown Error')
                }

                showToast(toast, 'success', 'All Alerts Marked as Read', values[0]?.message)
            } catch (e: any) {
                showToast(toast, 'error', 'Error', e?.message)
            }
        })()
    }

    const handleDeleteAll = () => {
        (async () => {
            let values = await Promise.all(alerts.filter(a => !a.read).map(async (alert: Alert) => {
                return await request({
                    url: '/api/alerts/delete',
                    method: 'DELETE',
                    body: { alertId: alert.id }
                })
            }))

            try {
                if (!values.every(res => res.success)) {
                    let index = values.findIndex(res => !res.success && res?.error)
                    throw new Error(index >= 0 ? values[index].error : 'Unknown Error')
                }

                showToast(toast, 'success', 'All Alerts Deleted', values[0]?.message)
            } catch (e: any) {
                showToast(toast, 'error', 'Error', e?.message)
            }
        })()
    }

    return user ? (
        <Layout>
            <div className='flex flex-col w-full'>
                <h2 className='text-2xl font-semibold text-aurora-red'>My Alerts</h2>
                <div className='flex justify-center md:justify-end gap-4 mt-2'>
                    <Button
                        variant='solid'
                        size='sm'
                        colorScheme=''
                        bgColor='frost.300'
                        color='snow.100'
                        onClick={handleReadAll}
                    >
                        Mark All as Read
                    </Button>
                    <Button
                        variant='solid'
                        size='sm'
                        colorScheme=''
                        bgColor='aurora.red.500'
                        color='snow.100'
                        onClick={handleDeleteAll}
                    >
                        Delete All
                    </Button>
                </div>
                {alerts.length > 0 ? (
                    <div className='mt-4 mx-0 md:mx-12 bg-night-400 shadow-md rounded'>
                        {alerts.map((alert) => (
                            <AlertItem key={alert.id} alert={alert} mutate={mutateAlerts} />
                        ))}
                    </div>
                ) : (
                    <div className='mt-4 mx-0 md:mx-12 bg-night-400 text-snow-100 shadow-md rounded py-2 px-4'>
                        <span>You do not have any alerts</span>
                    </div>
                )}
            </div>
        </Layout>
    ) : null
}

export default Alerts

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context
    const session = await getSession({ req })
    
    if (!session) {
        return {
            redirect: { destination: '/login', permanent: false }
        }
    }

    return { props: {} }
}