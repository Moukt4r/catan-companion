# Contributing to Catan Companion

First off, thank you for considering contributing to Catan Companion! It's people like you that make this tool better for everyone.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, constructive, and professional.

## How Can I Contribute?

### Reporting Bugs
- Use the GitHub issue tracker
- Check if the issue already exists
- Include detailed steps to reproduce
- Include screenshots if applicable
- Describe expected vs actual behavior

### Suggesting Enhancements
- Use the GitHub issue tracker
- Describe the enhancement in detail
- Explain why this enhancement would be useful
- Include mockups/examples if possible

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Follow the code style guidelines
3. Write comprehensive tests
4. Ensure the test suite passes
5. Write clear commit messages
6. Update documentation as needed

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define interfaces for props and state
- Use explicit return types for functions
- Use type guards when necessary

### React Components
- Use functional components with hooks
- Keep components focused and small
- Use proper prop types
- Implement error boundaries where needed

### CSS/Styling
- Use Tailwind utility classes
- Follow mobile-first approach
- Avoid inline styles
- Use semantic class names

### Testing
- Write tests for all new features
- Maintain >90% coverage
- Include unit and integration tests
- Mock external dependencies

## Git Commit Guidelines

Format: `<type>(<scope>): <subject>`

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
```
feat(dice): add special die support for Cities & Knights
```

## Branch Naming

Format: `<type>/<description>`

Examples:
- feature/special-die
- bugfix/roll-calculation
- docs/readme-update

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Update changelog if needed
4. Get one review approval
5. Ensure CI passes
6. Squash commits before merge

## Project Structure

```
├── components/        # React components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript types
├── styles/           # Global styles
└── tests/            # Test files
```

## Testing Guidelines

### Unit Tests
- Test individual components
- Mock dependencies
- Test edge cases
- Test error states

### Integration Tests
- Test component interactions
- Test user workflows
- Test state management

### Accessibility Tests
- Test keyboard navigation
- Test screen reader compatibility
- Test color contrast
- Test ARIA attributes

## Documentation

- Update README.md for new features
- Document props and types
- Include usage examples
- Document any breaking changes

## Release Process

1. Update version number
2. Update changelog
3. Create release PR
4. Tag release after merge
5. Create GitHub release

## Questions?

Feel free to open an issue for any questions about contributing!