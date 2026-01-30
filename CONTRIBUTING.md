# Contributing to Aurum Sanctuary

Thank you for your interest in contributing to Aurum Sanctuary! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize user privacy and security
- Follow the project's coding standards

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/aurum-sanctuary.git
   cd aurum-sanctuary
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Firebase and API keys
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Coding Standards

### TypeScript
- Use strict TypeScript types
- Avoid `any` types when possible
- Document complex type definitions

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Keep functions small and focused
- Write self-documenting code

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for utilities (`format-date.ts`)

### Privacy & Security
- **NEVER** log PII (Personally Identifiable Information)
- Use `logger.infoSafe()` instead of `console.log()`
- Encrypt sensitive data client-side
- Follow Admin-Blind architecture principles

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(auth): add Google Sign-In support
fix(journal): resolve encryption key generation issue
docs(readme): update installation instructions
refactor(api): simplify error handling logic
```

## Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**
   - Write clean, tested code
   - Follow coding standards
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   ```
   - Create a Pull Request on GitHub
   - Describe your changes clearly
   - Reference any related issues

6. **Code Review**
   - Address reviewer feedback
   - Keep PR scope focused
   - Be responsive to comments

## Testing Guidelines

- Write unit tests for utilities
- Test edge cases
- Verify privacy/security implications
- Test on multiple browsers

## Documentation

- Update README for new features
- Add JSDoc comments for complex functions
- Update architecture docs for major changes
- Include examples in documentation

## Questions?

If you have questions, please:
- Check existing documentation
- Search closed issues
- Open a new issue with the `question` label

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).
