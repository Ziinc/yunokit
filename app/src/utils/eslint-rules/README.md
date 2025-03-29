# Custom ESLint Rules

This directory contains custom ESLint rules for the project.

## Rules

### no-empty-select-item-value

This rule prevents using empty string values in `<SelectItem>` components, which causes runtime errors with Radix UI's Select component.

#### Rule Details

The Radix UI Select component requires that SelectItem values must not be empty strings. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.

Example of **incorrect** code:

```jsx
<SelectItem value="">Default</SelectItem>
<SelectItem value={someValue}>Label</SelectItem> // If someValue could be ""
```

Example of **correct** code:

```jsx
<SelectItem value="default">Default</SelectItem>
<SelectItem value={someValue || "default"}>Label</SelectItem>
```

#### When Not To Use It

If you're not using Radix UI's Select component, you can disable this rule.

#### Further Reading

- [Radix UI Select Documentation](https://www.radix-ui.com/primitives/docs/components/select) 