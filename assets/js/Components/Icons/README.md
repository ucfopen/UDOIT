# Icons

## Source

All icons used in UDOIT are open-source SVG files downloaded from Google's Materia toolkit at (fonts.google.com/icons)[fonts.google.com/icons].

For consistency, each icon uses the same settings:

- Weight: 400
- Grade: 0
- Optical Size: 24px
- Style: Rounded

When importing the icons, we've converted them into useable React components. In order to remove the default color and to pass props to the icons instead, remove the `<svg>` element's `fill` attribute and replace it with `props={...props}`. Look at any previously-imported icon as a template.

## Use

Icons can change size and color based on various classes in the `./css/udoit4-theme.css` file. For example, if you wanted to place the "Home" icon in medium size and the theme's primary color, you would import and use the following element:

```
import HomeIcon from `./Icons/HomeIcon`
...
/* and later, somewhere in the return () JSX: */
<HomeIcon className="icon-md primary" />
```

### Icon Size

The following classes are available for various icon sizes. Do not use custom classes or additional CSS to make others.

- .icon-sm: 16px x 16px
- .icon-md: 24px x 24px
- .icon-lg: 32px x 32px
- .icon-xl: 40px x 40px

### Icon Color

The following classes are available for various icon colors. If you need the hex codes, check the beginning of the `./css/udoit4-theme.css` file.

- .primary: Primary theme color
- .primary-dark: Darker version of primary theme color
- .color-link: Color of link text
- .color-issue: Color of issues (red)
- .color-potential: Color of potential issues (orange/yellow)
- .color-suggestions: Color of suggestions (blue)
- .color-success: Color of success marks (green)
- .white: White
- .gray: Gray

### Spinners

To make a progress animation or other icon spin, wrap it in a parent `<div>` (make sure it's the only child), and give the parent the `spinner` class.