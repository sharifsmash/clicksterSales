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
  			shine: 'shine 3s ease-in-out infinite',
            marquee: 'marquee var(--duration) linear infinite',
            'marquee-slow': 'marquee calc(var(--duration) * 5) linear infinite',
  		},
  		keyframes: {
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			shine: {
  				'0%': {
  					'background-position': '0% 0%',
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					'background-position': '0% 0%',
  					transform: 'translateX(100%)'
  				}
  			},
            marquee: {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(calc(-100% - var(--gap)))' },
            },
  		}
  	}
  },
  plugins: [],
}
