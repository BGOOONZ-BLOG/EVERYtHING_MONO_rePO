import React from 'react'
import { useTransition } from 'react-spring'
import { useDarkMode } from '../../hooks'
import { Box, Div, Icons, Notification } from './styles'

const modes = {
  light: [`Light Mode`, Icons.Sun, `dark`],
  dark: [`Dark Mode`, Icons.Moon, `osPref`],
  osPref: [`OS setting`, Icons.SunMoon, `light`],
}

export default function DarkToggle(props) {
  const [colorMode, setColorMode] = useDarkMode()

  const transition = useTransition(colorMode, {
    initial: null,
    from: { opacity: 0, transform: `translateX(100%)` },
    enter: { opacity: 1, transform: `translateX(0%)` },
    leave: { opacity: 0, transform: `translateX(-100%)` },
  })

  return (
    <Box {...props}>
      {transition((style, item) => {
        // Since we can't know the value of media queries or localStorage during SSR,
        // defer any rendering of the toggle until after rehydration on the client.
        if (![`light`, `dark`, `osPref`].includes(item)) return null
        const [title, Icon, nextMode] = modes[item]
        return (
          <Div key={item} style={style}>
            <Icon title={title} onClick={() => setColorMode(nextMode)} />
            <Notification>{title}</Notification>
          </Div>
        )
      })}
    </Box>
  )
}
