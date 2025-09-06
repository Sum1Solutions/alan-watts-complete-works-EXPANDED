# Testing Documentation

## Test Structure

This project uses a comprehensive testing strategy with multiple layers:

### Unit Tests (`/tests/unit/`)
- **Framework**: Vitest + React Testing Library
- **Coverage**: React components, utility functions, content recommendation logic
- **Run**: `npm run test:unit`

### API Tests (`/tests/api/`)  
- **Framework**: Vitest
- **Coverage**: Chat API functionality, theme extraction, context building
- **Run**: `npm run test:api`

### End-to-End Tests (`/tests/e2e/`)
- **Framework**: Playwright
- **Coverage**: Full user workflows, chat functionality, content navigation
- **Run**: `npm run test:e2e`

## Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:api  
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run tests in watch mode
npm run test:unit -- --watch
```

## Test Categories

### Chat Functionality Tests
- Message sending and receiving
- AI response handling
- Error state management
- Input focus maintenance
- Content recommendations triggering

### Content Navigation Tests
- Tab switching
- Content display verification
- External link handling
- Mobile responsiveness
- Theme switching

### API Integration Tests
- Theme extraction accuracy
- Personal context building
- Conversation memory
- Error handling
- Response structure validation

### Performance Tests
- Response time measurement
- Memory usage monitoring
- Concurrent user simulation
- Load testing scenarios

## Test Data

### Mock Responses
Tests use realistic mock data that mirrors the actual AI responses:
- Biographical references
- Philosophical insights
- Personal anecdotes
- Content recommendations

### Test Scenarios
- New user interactions
- Returning user conversations  
- Error conditions
- Edge cases
- Cross-browser compatibility

## CI/CD Integration

Tests are designed to run in CI environments with:
- Headless browser support
- Parallel execution
- Retry mechanisms for flaky tests
- Comprehensive reporting

## Quality Metrics

### Coverage Targets
- Unit tests: >85% code coverage
- E2E tests: All critical user paths
- API tests: All endpoints and error conditions

### Performance Benchmarks
- Page load: <2 seconds
- Chat response: <5 seconds  
- Theme switching: <100ms
- Content navigation: <500ms

## Future Enhancements

### RAG Testing (Planned)
When RAG is implemented, additional tests will cover:
- Vector similarity accuracy
- Content retrieval relevance
- Citation correctness
- Knowledge base consistency

### Advanced Scenarios
- Multi-session conversation continuity
- Content recommendation accuracy
- Biographical fact verification
- Philosophical consistency checks