import { NextRouter } from 'next/router'

const refreshData = (router: NextRouter) => {
    router.replace(router.asPath)
}

export default refreshData