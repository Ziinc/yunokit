# Component Library

Supacontent ships with a React component library for rapidly prototyping and building content interfaces.

## Getting Started

1. Install the component library

   ```bash
   npm i "@ziinc/supacontent-lib"
   ```

2. Add the component into your app.

   ```jsx
   import { ContentList } from "@ziinc/supacontent-lib";

   const YourApp = () => (
     <div>
       <ContentList />
     </div>
   );
   ```

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
