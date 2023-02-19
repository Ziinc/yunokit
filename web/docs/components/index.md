# Component Library

## Base Styles

All components ship with basic styling. Styling is unopinionated and can be overridden or extended in multiple ways.

In order to use the base styles, you will need to import the stylesheet.

```js
import "@ziinc/supacontent-lib/dist/styles.css";
```

### Overriding and Extending

#### Classes

The recommended way to extend styling by adding a `classNames` prop to the component. This works well with functional css frameworks like TailwindCSS and Bulma.

#### Overriding through CSS

You may also choose to override the CSS through your own css stylesheet. Ensure that you have imported your own stylesheet **after** importing the base styles.

```js
import "@ziinc/supacontent-lib/dist/styles.css";
import "my_stylesheet.css";
```

You will need to pass your own classes to the component for targeting the elemeent(s).

For example, to style the [ContentList](./ui/ContentList) component, you would do the following:

```jsx
<ContentList itemClassName="my-item-class" ... />
```
