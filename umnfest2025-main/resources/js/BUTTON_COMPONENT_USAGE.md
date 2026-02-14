# Button Component Usage Guide

## Overview
The Button component has been enhanced to support custom font sizes and padding while maintaining responsive design and accessibility.

## Features
- **Responsive by default**: Scales appropriately across all breakpoints
- **Custom styling support**: Override font size and padding via props or className
- **Multiple variants**: primary, secondary, outline
- **Link support**: Renders as `<a>` tag when `href` prop is provided
- **Accessibility**: Proper disabled states and cursor handling

## Usage Methods

### 1. Default Responsive Button
```jsx
<Button>Click me</Button>
```
Uses the default responsive font sizes and padding that scale from mobile to desktop.

### 2. Custom Styling with className (Recommended for Tailwind)
```jsx
<Button className="text-[12px] px-4 py-2">Small button</Button>
```
This approach uses Tailwind classes to override the default responsive styling.

### 3. Custom Styling with Props
```jsx
<Button fontSize="14px" padding="6px 12px">Custom button</Button>
```
This approach uses inline styles for precise control.

### 4. Link Button
```jsx
<Button href="/about">About</Button>
```
Renders as an anchor tag instead of a button.

## Implementation in EventCardSection
The EventCardSection now uses the shared Button component:

```jsx
<Button
    href="#"
    className="text-[12px] px-4 py-2"
    onClick={(e) => e.stopPropagation()}
>
    Pelajari Lebih Lanjut
</Button>
```

This ensures:
- Consistent styling across the application
- Reduced code duplication
- Maintainable button styles
- Proper hover and focus states

## Technical Details
- When custom `fontSize`, `padding`, or relevant classes are detected in `className`, the component automatically disables default responsive classes to prevent conflicts
- The component maintains responsive border radius even when using custom sizing
- All variants (primary, secondary, outline) work with custom sizing
- Disabled state is properly handled with opacity and cursor changes

## Benefits
1. **Consistency**: All buttons use the same base styling and behavior
2. **Flexibility**: Easy to customize for specific use cases
3. **Maintainability**: Changes to button styles can be made in one place
4. **Accessibility**: Proper ARIA attributes and keyboard navigation
5. **Performance**: No unnecessary re-renders or style calculations
