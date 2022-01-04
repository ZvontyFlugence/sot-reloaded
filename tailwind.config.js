module.exports = {
  mode: 'jit',
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        night: {
          100: '#4c566a',
          200: '#434c5e',
          300: '#3b4252',
          400: '#2e3440'
        },
        snow: {
          100: '#eceff4',
          200: '#e5e9f0',
          300: '#d8dee9'
        },
        frost: {
          100: '#8fbcbb',
          200: '#88c0d0',
          300: '#81a1c1',
          400: '#5e81ac'
        },
        aurora: {
          red: '#bf616a',
          orange: '#d08770',
          yellow: '#ebcb8b',
          green: '#a3b38c',
          purple: '#b48ead'
        }
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
