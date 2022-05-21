# Gatsby Dark Mode Minimal

[![dark-mode-mvp screenshot](dark-mode.svg)](https://gatsby-dark-mode-minimal.netlify.app)

MVP of rehydration-safe (aka SSR-compatible), flicker-free dark mode in Gatsby. It revolves around a `useDarkMode` hook which in turn calls a `useLocalStorage` hook to persist the users preference across page visits and a `useMediaQuery` hook to default to the OS color scheme setting. `useMediaQuery` also registers an event listener that automatically changes the color mode if the state of the `(prefers-color-scheme: dark)` media query changes in the background, say because the user scheduled his OS tu activate dark mode after sunset. It's perhaps worth noting that no other dark mode implementation I could find does this.

The code in `gatsby-ssr.js` was adapted from [Joshua Comeau's implementation](https://github.com/joshwcomeau/dark-mode-minimal).

## Additional Resources

It's described in more detail on my and Joshua's blog:

- <https://janosh.dev/blog/use-dark-mode>
- <https://joshwcomeau.com/gatsby/dark-mode>

You can check out the **live demo** here:

<https://gatsby-dark-mode-minimal.netlify.app>

## Notable files

- [gatsby-ssr.js](https://github.com/janosh/dark-mode-minimal/blob/master/gatsby-ssr.js)
- [src/components/DarkToggle/index.js](https://github.com/janosh/dark-mode-minimal/blob/master/src/components/DarkToggle/index.js)
- [src/hooks/useDarkMode.js](https://github.com/janosh/dark-mode-minimal/blob/master/src/hooks/useDarkMode.js)
- [src/constants.js](https://github.com/janosh/dark-mode-minimal/blob/master/src/constants.js)
