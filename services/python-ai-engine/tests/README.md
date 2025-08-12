# Python AI Engine Test Suite

This directory contains comprehensive unit and integration tests for the Python AI Engine service.

## Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── test_creative_service.py
│   ├── test_video_generation.py
│   ├── test_prompt_service.py
│   ├── test_firebase_storage.py
│   ├── test_agent_service.py
│   ├── test_analysis_service.py
│   └── test_insights_service.py
├── integration/             # Integration tests for service interactions
│   ├── test_grpc_server.py
│   ├── test_video_providers.py
│   └── test_end_to_end.py
├── fixtures/                # Test data and mock objects
│   ├── mock_data.py
│   ├── test_prompts.py
│   └── video_samples.py
├── conftest.py             # Pytest configuration and shared fixtures
└── README.md              # This file
```

## Running Tests

### All Tests

```bash
cd services/python-ai-engine
python -m pytest tests/ -v
```

### Unit Tests Only

```bash
python -m pytest tests/unit/ -v
```

### Integration Tests Only

```bash
python -m pytest tests/integration/ -v
```

### With Coverage

```bash
python -m pytest tests/ --cov=app --cov-report=html
```

### Specific Test File

```bash
python -m pytest tests/unit/test_creative_service.py -v
```

## Test Categories

### Unit Tests

- **Creative Service**: Test AI model initialization, prompt generation, content creation
- **Video Generation**: Test provider adapters, video request handling, error scenarios
- **Prompt Service**: Test prompt enhancement, quantification, regeneration logic
- **Firebase Storage**: Test file upload, download, URL generation, error handling
- **Agent Service**: Test workflow execution, task coordination, state management
- **Analysis Service**: Test data processing, metric calculation, insight generation
- **Insights Service**: Test business intelligence, trend analysis, recommendations

### Integration Tests

- **gRPC Server**: Test API endpoints, request/response validation, error handling
- **Video Providers**: Test actual provider integrations (with mocking)
- **End-to-End**: Test complete workflows from request to response

## Environment Variables for Testing

Create a `.env.test` file:

```bash
# Test environment settings
OPENAI_API_KEY=test_key_12345
GOOGLE_API_KEY=test_key_67890
FIREBASE_STORAGE_BUCKET=test-bucket
FIREBASE_VIDEO_PREFIX=test-videos
LOG_LEVEL=debug

# Provider test keys (use test/sandbox keys)
RUNWAY_API_KEY=test_runway_key
PIKA_API_KEY=test_pika_key
STABILITY_API_KEY=test_stability_key
LUMA_API_KEY=test_luma_key
```

## Mocking Strategy

- **External APIs**: Mock all third-party AI provider calls
- **Firebase**: Mock Firebase admin SDK operations
- **File Operations**: Mock file uploads and downloads
- **Network Calls**: Mock all HTTP requests to external services

## Best Practices

1. **Isolation**: Each test should be independent and not rely on external services
2. **Fast Execution**: Unit tests should complete in milliseconds
3. **Comprehensive Coverage**: Aim for >90% code coverage
4. **Clear Naming**: Test names should describe the scenario being tested
5. **Documentation**: Complex test scenarios should be well-documented
