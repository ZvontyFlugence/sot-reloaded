import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

export default extendTheme({
	config: {
		initialColorMode: 'system',
		useSystemColorMode: false,
	},
	styles: {
		global: (props: any) => ({
			body: {
				bg: mode('snow.200', 'night.300')(props),
				color: mode('night.400', 'snow.100')(props),
				fontFamily: 'body',
			},
		}),
	},
	colors: {
		night: {
			100: '#4c566a',
			200: '#434c5e',
			300: '#3b4252',
			400: '#2e3440',
		},
		snow: {
			100: '#eceff4',
			200: '#e5e9f0',
			300: '#d8dee9',
		},
		frost: {
			100: '#8fbcbb',
			200: '#88c0d0',
			300: '#81a1c1',
			400: '#5e81ac',
		},
		aurora: {
			red: '#bf616a',
			'red.500': '#bf616a',
			orange: '#d08770',
			'orange.200': '#d08770',
			yellow: '#ebcb8b',
			'yellow.500': '#ebcb8b',
			green: '#a3b38c',
			'green.200': '#a3b38c',
			purple: '#b48ead',
			'purple.500': '#b48ead',
		},
	},
	fonts: {
		body: '"Quicksand", Ubuntu, Roboto, Oxygen, sans-serif',
		heading: '"Quicksand", Ubuntu, Roboto, Oxygen, sans-serif',
	},
	textStyles: {
		body: {
			fontFamily: '"Quicksand", Ubuntu, Roboto, Oxygen, sans-serif',
		},
		heading: {
			fontFamily: '"Quicksand", Ubuntu, Roboto, Oxygen, sans-serif',
		},
	},
})
