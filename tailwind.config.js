module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		backgroundColor: {
  			background: 'var(--background)'
  		},
  		animation: {
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			shine: 'shine var(--duration) infinite linear'
  		},
  		keyframes: {
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			shine: {
  				'0%': {
  					'background-position': '0% 0%'
  				},
  				'50%': {
  					'background-position': '100% 100%'
  				},
  				to: {
  					'background-position': '0% 0%'
  				}
  			}
  		}
  	}
  },
  plugins: [],
}
