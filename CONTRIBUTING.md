# Contributing to EduQuest

Thank you for your interest in contributing to EduQuest! This document provides guidelines and information for contributors.

## Getting Started

### Ways to Contribute

- **Report bugs** - Help us fix issues
- **Suggest features** - Share your ideas
- **Improve documentation** - Make EduQuest easier to understand
- **Submit pull requests** - Fix bugs or add features
- **Write tests** - Improve code reliability
- **Translate** - Help EduQuest reach more users
- **Community support** - Help others in discussions

### First-Time Contributors

If this is your first contribution, welcome! Here's a quick guide:

1. **Read this document** thoroughly
2. **Look for "good first issue"** labels on GitHub
3. **Join our Discord** for help and guidance
4. **Start small** - documentation fixes are great first contributions

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB 5.0 or higher
- Git

### Setup Steps

1. **Fork the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/eduQuest.git
   cd eduQuest
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment**

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   # Edit the .env files with your configuration
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Contribution Guidelines

### Code Style

We use automated tools to maintain code quality:

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks

Run these commands before committing:

```bash
npm run lint
npm run format
npm test
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Build process or dependency changes

**Examples:**

```
feat(playground): add Python language support
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoints
```

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `test/test-improvement` - Test-related changes
- `refactor/code-cleanup` - Code refactoring

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following our guidelines
3. **Test thoroughly** - ensure all tests pass
4. **Update documentation** if needed
5. **Submit a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

## Project Structure

```
eduQuest/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Redux store configuration
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Server utilities
│   └── tests/            # Server tests
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run client tests
cd client && npm test

# Run server tests
cd server && npm test

# Run with coverage
npm run test:coverage
```

### Writing Tests

- **Unit tests** for individual functions/components
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Test coverage** should be >80%

### Test Structure

```
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
├── e2e/                 # End-to-end tests
└── fixtures/            # Test data
```

## Documentation

### Types of Documentation

- **API Documentation** - Endpoint descriptions and examples
- **User Documentation** - Guides and tutorials
- **Developer Documentation** - Setup and contribution guides
- **Code Comments** - Complex logic explanations

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date

## Issue Labels

### Issue Types

- `bug` - Software bugs
- `enhancement` - Feature requests
- `documentation` - Documentation issues
- `good first issue` - Great for newcomers
- `help wanted` - Community assistance needed
- `priority/high` - Urgent issues
- `priority/medium` - Normal priority
- `priority/low` - Low priority

### Areas

- `frontend` - React client issues
- `backend` - Node.js server issues
- `ai` - AI/ML features
- `database` - MongoDB related
- `devops` - Deployment and infrastructure
- `security` - Security concerns

## Security

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not open a public issue**
2. **Email us at security@eduquest.dev**
3. **Provide detailed information** about the vulnerability
4. **Wait for our response** before disclosing publicly

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Validate all user inputs
- Use HTTPS in production

## Internationalization

### Adding Translations

1. **Find the language file** in `client/src/locales/`
2. **Add new translations** following the existing format
3. **Test the translation** in the application
4. **Submit a pull request** with your changes

### Supported Languages

- English (en) - Default
- Spanish (es) - In progress
- French (fr) - Planned
- Chinese (zh) - Planned

## Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Steps

1. **Update version numbers** in package.json files
2. **Update CHANGELOG.md** with release notes
3. **Create a release tag** on GitHub
4. **Deploy to production**
5. **Announce the release**

## Community

### Getting Help

- **Discord** - Real-time chat with the community
- **GitHub Discussions** - Questions and ideas
- **Documentation** - Official guides and API docs
- **Email** - support@eduquest.dev

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge generously
- Follow the Code of Conduct

## Recognition

### Contributor Recognition

- **Contributors page** on our website
- **GitHub contributors** list
- **Discord roles** for active contributors
- **Swag and merchandise** for significant contributions
- **Mentorship opportunities** for dedicated contributors

### Becoming a Maintainer

Active contributors may be invited to become maintainers. Criteria:

- Consistent quality contributions
- Understanding of the codebase
- Participation in code reviews
- Community leadership

## Contact

### Questions?

- **General questions**: Use GitHub Discussions
- **Bug reports**: Open an issue on GitHub
- **Security issues**: security@eduquest.dev
- **Business inquiries**: business@eduquest.dev

---

Thank you for contributing to EduQuest! Your help makes computer science education more accessible and enjoyable for everyone.
