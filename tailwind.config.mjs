/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class", '[data-theme="dark"]'],

  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // brand: colors.purple,
        neutral: colors.slate,
        // error: colors.red,
        // success: colors.green,
        // warning: colors.yellow,
        // info: colors.blue,
        // accent: colors.orange,
        // muted: colors.gray,
        // primary: colors.blue,
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // primary: {
        //   // DEFAULT: "hsl(var(--primary))",
        //   // foreground: "hsl(var(--primary-foreground))",
        // },
        primary: {
          DEFAULT: colors.blue[500],
          foreground: colors.blue[50],
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        brand: {
          DEFAULT: colors.purple[500],
          foreground: colors.purple[50],
        },
        error: {
          DEFAULT: colors.pink[500],
          foreground: colors.red[50],
        },
        success: {
          DEFAULT: colors.green[500],
          foreground: colors.green[50],
        },
        warning: {
          DEFAULT: colors.yellow[500],
          foreground: colors.black,
        },
        info: {
          DEFAULT: colors.blue[500],
          foreground: colors.blue[50],
        },
        accent: {
          DEFAULT: colors.orange[500],
          foreground: colors.orange[50],
        },
        muted: {
          DEFAULT: colors.gray[500],
          foreground: colors.gray[50],
        },

        // success: {
        //   DEFAULT: "hsl(var(--success))",
        //   foreground: "hsl(var(--success-foreground))",
        // },
        // warning: {
        //   DEFAULT: "hsl(var(--warning))",
        //   foreground: "hsl(var(--warning-foreground))",
        // },
        // info: {
        //   DEFAULT: "hsl(var(--info))",
        //   foreground: "hsl(var(--info-foreground))",
        // },
        // error: {
        //   DEFAULT: "hsl(var(--error))",
        //   foreground: "hsl(var(--error-foreground))",
        // },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
  			},
        "nord-neutral": {
          DEFAULT: "#494E59",
          dark: "#EFF1F5",
        },
        "nord-neutral-deep": {
          DEFAULT: "#2E3440",
          dark: "#ECEFF4",
        },
        "nord-dim": {
          DEFAULT: "#ABAEB3",
          dark: "#F7F9FB",
        },
        "nord-solid": {
          DEFAULT: "#636C7D",
          dark: "#D8DEE9",
        },
        "nord-primary": "#5E81AC",
        "nord-secondary": "#CFDBE7",
        "nord-secondary-deep": "#81A1C1",
        "nord-secondary-dim": "#F0F4F8",
        "nord-outline": {
          DEFAULT: "#D8DEE9",
          dark: "#434C5E",
        },
        "nord-background": {
          DEFAULT: "#ECEFF4",
          dark: "#2E3440",
        },
        "nord-foreground": {
          DEFAULT: "#FFFFFF",
          dark: "#252932",
        },        
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {           
            '--tw-prose-bold': 'currentColor',
            '--tw-prose-invert-bold': 'currentColor',
          },
        },
      }),
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // sans: [...fontFamily.sans],
        sans: '"Nunito", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',

      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [require("tailwind-nord"), require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
