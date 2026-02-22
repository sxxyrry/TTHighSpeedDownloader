export const mediaQueryList = {
    mobileS: matchMedia(`(max-width: ${320 /* mediaQueries.mobileS */}px)`),
    mobileM: matchMedia(`(max-width: ${375 /* mediaQueries.mobileM */}px)`),
    mobileL: matchMedia(`(max-width: ${425 /* mediaQueries.mobileL */}px)`),
    tablet: matchMedia(`(max-width: ${768 /* mediaQueries.tablet */}px)`),
    laptop: matchMedia(`(max-width: ${1024 /* mediaQueries.laptop */}px)`),
    laptopL: matchMedia(`(max-width: ${1440 /* mediaQueries.laptopL */}px)`),
    pointerCoarse: matchMedia('(pointer: coarse)'),
    pointerFine: matchMedia('(pointer: fine)')
};
