# Developer Guide

This guide covers setting up a local development environment and contributing to Computer Store KS Version 3.0.

## Table of Contents

- [Setting Up Local Development](#setting-up-local-development)
- [Code Structure and Conventions](#code-structure-and-conventions)
- [Component Library Overview](#component-library-overview)
- [Adding New Pages](#adding-new-pages)
- [Adding New Components](#adding-new-components)
- [Testing](#testing)
- [Git Workflow](#git-workflow)

## Setting Up Local Development

### Prerequisites

- **Node.js:** 18.17.0 or higher
- **Bun:** Latest version (recommended)
- **Git:** For version control
- **VS Code:** Recommended editor

### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Clone and Install

```bash
# Clone repository
git clone https://github.com/MatthewMcManness/Computer_Store_KS.git
cd Computer_Store_KS

# Checkout development branch
git checkout version-3.0

# Install dependencies
bun install
```

### Environment Setup

Create `.env.local` in project root:

```env
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional for dev - form will log instead of send)
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_EMAIL=contact@computerstoreks.com
```

### Start Development Server

```bash
bun run dev
```

The site will be available at http://localhost:3000 with hot reload enabled.

### Gallery API Setup (Optional)

For gallery management features:

```bash
# Install API dependencies
cd api
bun install

# Configure API environment
cp .env.example .env
# Edit .env with your GitHub token

# Start API server
bun start
```

### VS Code Extensions

Recommended extensions:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **PostCSS Language Support** - PostCSS syntax

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Code Structure and Conventions

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (/)
│   ├── loading.tsx         # Loading UI
│   ├── error.tsx           # Error UI
│   ├── not-found.tsx       # 404 page
│   └── [route]/            # Additional routes
│       └── page.tsx
│
├── components/
│   ├── ui/                 # Primitive UI components
│   ├── layout/             # Layout components (header, footer)
│   ├── home/               # Home page specific components
│   ├── gallery/            # Gallery components
│   ├── forms/              # Form components
│   └── seo/                # SEO components
│
├── lib/                    # Utility functions
│   ├── constants.ts        # Constants and config
│   └── utils.ts            # Helper functions
│
└── types/                  # TypeScript type definitions
    └── index.ts
```

### Naming Conventions

#### Files and Folders
- Use **kebab-case** for files: `contact-form.tsx`
- Use **kebab-case** for folders: `hero-section/`
- Use **PascalCase** for component exports: `export function ContactForm()`

#### Components
- **UI components:** Named for their function: `Button`, `Card`, `Input`
- **Feature components:** Named descriptively: `HeroSection`, `GalleryGrid`

#### Variables and Functions
- Use **camelCase** for variables: `const formData`
- Use **camelCase** for functions: `function handleSubmit()`
- Use **SCREAMING_SNAKE_CASE** for constants: `const API_URL`

### TypeScript Guidelines

- Always define types for component props
- Use interface for object types
- Export types from `src/types/index.ts`

```typescript
// Component prop types
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  // ...
}
```

### CSS and Styling

#### Tailwind CSS Classes
- Use utility classes directly in JSX
- Group related classes together
- Use the `cn()` helper for conditional classes

```typescript
import { cn } from '@/lib/utils';

<div
  className={cn(
    // Base styles
    'rounded-lg border p-4',
    // Conditional styles
    isActive && 'border-primary-600 bg-primary-50',
    // Variant styles
    variant === 'outline' && 'bg-transparent'
  )}
/>
```

#### Custom CSS
- Avoid custom CSS when Tailwind utilities suffice
- Use CSS variables for theming (defined in `globals.css`)
- Use CSS modules for complex, isolated styles

### Import Organization

Order imports as follows:

```typescript
// 1. React and Next.js
import * as React from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { clsx } from 'clsx';
import { Send } from 'lucide-react';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal utilities and types
import { cn } from '@/lib/utils';
import { BUSINESS_INFO } from '@/lib/constants';
import type { FormData } from '@/types';
```

## Component Library Overview

### UI Components

Located in `src/components/ui/`:

#### Button
Flexible button component with variants and loading state.

```typescript
import { Button } from '@/components/ui/button';

<Button variant="primary" size="lg" isLoading={loading}>
  Submit
</Button>
```

**Props:**
- `variant`: primary | secondary | outline | ghost | destructive | link
- `size`: sm | md | lg | icon
- `isLoading`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

#### Card
Container component for content sections.

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Input
Text input with label and error handling.

```typescript
import { Input } from '@/components/ui/input';

<Input
  label="Email"
  name="email"
  type="email"
  value={value}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

#### Textarea
Multi-line text input.

```typescript
import { Textarea } from '@/components/ui/textarea';

<Textarea
  label="Message"
  name="message"
  rows={5}
  value={value}
  onChange={handleChange}
  error={errors.message}
/>
```

#### Select
Dropdown select input.

```typescript
import { Select } from '@/components/ui/select';

<Select
  label="Service"
  name="service"
  options={[
    { value: 'repair', label: 'Computer Repair' },
    { value: 'sales', label: 'Buy a Computer' },
  ]}
  value={value}
  onChange={handleChange}
/>
```

#### Badge
Small status indicator.

```typescript
import { Badge } from '@/components/ui/badge';

<Badge variant="success">In Stock</Badge>
```

#### Skeleton
Loading placeholder.

```typescript
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-4 w-[200px]" />
```

### Layout Components

Located in `src/components/layout/`:

#### Container
Centered, max-width container.

```typescript
import { Container } from '@/components/layout/container';

<Container>
  <h1>Page Content</h1>
</Container>
```

#### Header / Footer
Site-wide header and footer components.

### Utility Functions

Located in `src/lib/utils.ts`:

```typescript
// Merge Tailwind classes
cn('bg-red-500', isActive && 'bg-blue-500')

// Format phone number
formatPhoneNumber('7852673223') // '(785) 267-3223'

// Format currency
formatCurrency(299) // '$299.00'

// Create URL slug
slugify('HP ProDesk 400') // 'hp-proDesk-400'

// Truncate text
truncate('Long text here', 10) // 'Long text...'
```

## Adding New Pages

### Step 1: Create Page File

Create a new file in the `src/app` directory:

```bash
# For /services route
mkdir -p src/app/services
touch src/app/services/page.tsx
```

### Step 2: Implement Page Component

```typescript
// src/app/services/page.tsx
import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Computer repair services including virus removal, data recovery, and hardware upgrades in Topeka, KS.',
};

export default function ServicesPage() {
  return (
    <Container>
      <h1 className="text-3xl font-bold">Our Services</h1>
      {/* Page content */}
    </Container>
  );
}
```

### Step 3: Add to Navigation

Update `src/lib/constants.ts`:

```typescript
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Computers', href: '/computers' },
  { label: 'Services', href: '/services' },  // Add new page
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;
```

### Dynamic Routes

For dynamic content:

```typescript
// src/app/computers/[id]/page.tsx
interface Props {
  params: { id: string };
}

export default function ComputerPage({ params }: Props) {
  return <div>Computer ID: {params.id}</div>;
}
```

## Adding New Components

### Step 1: Create Component File

```bash
# UI component
touch src/components/ui/tooltip.tsx

# Feature component
mkdir -p src/components/services
touch src/components/services/service-card.tsx
```

### Step 2: Implement Component

```typescript
// src/components/ui/tooltip.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-10 rounded bg-gray-900 px-2 py-1 text-sm text-white',
            position === 'top' && 'bottom-full left-1/2 mb-2 -translate-x-1/2',
            position === 'bottom' && 'left-1/2 top-full mt-2 -translate-x-1/2'
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Export from Index

Update the folder's `index.ts`:

```typescript
// src/components/ui/index.ts
export * from './button';
export * from './card';
export * from './tooltip';  // Add new component
```

### Step 4: Use Component

```typescript
import { Tooltip } from '@/components/ui';

<Tooltip content="Click to submit">
  <Button>Submit</Button>
</Tooltip>
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/components/ui/button.test.tsx

# Run tests in watch mode
bun test --watch
```

### Writing Tests

Create test files alongside components:

```typescript
// src/components/ui/button.test.tsx
import { test, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeDefined();
});

test('applies primary variant styles', () => {
  render(<Button variant="primary">Button</Button>);
  const button = screen.getByRole('button');
  expect(button.className).toContain('bg-primary');
});

test('shows loading spinner when isLoading', () => {
  render(<Button isLoading>Loading</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

### Type Checking

```bash
# Run TypeScript compiler check
bun run type-check

# Or directly
tsc --noEmit
```

### Linting

```bash
# Run ESLint
bun run lint

# Auto-fix issues
bun run lint --fix
```

## Git Workflow

### Branches

- **main:** Production-ready code
- **version-3.0:** Development branch for v3
- **feature/*:** Feature branches

### Workflow

1. **Create feature branch:**
   ```bash
   git checkout version-3.0
   git pull origin version-3.0
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add tooltip component"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **After review, merge to version-3.0**

### Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(gallery): add category filter component
fix(contact): resolve email validation bug
docs(readme): update installation instructions
style(button): fix indentation
refactor(utils): simplify cn function
test(card): add snapshot tests
chore(deps): update tailwindcss to v3.4
```

### Pull Request Guidelines

- Write clear PR description
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Request review from team member

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Components are accessible (ARIA labels, keyboard nav)
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings
- [ ] Tests are included and passing

## Related Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [GALLERY_SYSTEM.md](./GALLERY_SYSTEM.md) - Gallery management

---

For questions about development practices, refer to the Next.js and Tailwind CSS documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
