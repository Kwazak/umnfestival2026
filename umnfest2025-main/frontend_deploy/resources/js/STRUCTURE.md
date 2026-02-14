# Project Structure

## Components (`/resources/js/Components/`)
Reusable UI components, layout components, and feature components that can be used throughout the application.

### UI Components
- **Button** - Customizable button component with variants (primary, secondary, outline) and sizes (small, medium, large)
- **HeadText** - Heading text with responsive sizing
- **SubText** - Subtitle/description text with responsive sizing
- **Text** - Regular paragraph text with responsive sizing

### Layout Components
- **Navbar** - Navigation component with mobile responsive menu
- **Footer** - Site footer with social links and navigation

### Feature Components
- **EventCardSection** - Interactive event cards with flip animation

## Layouts (`/resources/js/Layouts/`)
Layout components that define the structure and positioning of page sections.

- **MainLayout** - Main app layout wrapper
- **BackgroundSection** - Background image/styling for pages
- **HeroSection** - Hero banner section
- **IntroductionSection** - Introduction content section
- **CountdownSection** - Countdown timer section
- **ClosingSection** - Footer/closing section

## Pages (`/resources/js/Pages/`)
Complete page components that compose layouts and components.

- **Home** - Main homepage

## Usage Examples

### Using UI Components
```jsx
import { Button, HeadText, SubText, Text } from '../Components';

// Button usage
<Button variant="primary" size="large" href="/about">
    Learn More
</Button>

// Text components
<HeadText color="#1F5A9F" textAlign="center">
    Main Title
</HeadText>

<SubText color="#666666" textAlign="left">
    Subtitle description here
</SubText>

<Text color="#333333" textAlign="left">
    Regular paragraph text here
</Text>
```

### Using Layout Components
```jsx
import { Navbar, Footer } from '../Components';

// Layout components
<Navbar />
<Footer />
```

### Default Styling
- **Colors**: 
  - Primary: `#1F5A9F` (blue)
  - Button: `#B42129` (red)
  - SubText: `#666666` (gray)
  - Text: `#333333` (dark gray)
- **Fonts**: All components use `tracking-[0.04em]` for letter spacing
- **Responsive**: All text components include responsive sizing across breakpoints

## Text Component Hierarchy
1. **HeadText** - Main page titles, hero headings, section titles
2. **SubText** - Descriptions, subtitles, important secondary text
3. **Text** - Regular content, body text, general paragraphs

## File Organization Rules
- **Components**: Reusable UI elements, layout components, and self-contained features
- **Layouts**: Page structure and section positioning components
- **Pages**: Complete page compositions using layouts and components
