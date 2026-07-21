.PHONY: build test test-units test-valid test-invalid test-glob

IMAGE_NAME = local-action
PWD = $(shell pwd)

# Build the local Docker image
build:
	docker build -t $(IMAGE_NAME):latest .

# Run all tests
test: test-units test-valid test-invalid test-glob

# Test Coverage
test-units:
	npm run test

# Test Valid JSON (Should pass)
test-valid: build
	@echo "\n--- Testing Valid JSON ---"
	docker run --rm \
		-v $(PWD):/github/workspace \
		-e GITHUB_WORKSPACE=/github/workspace \
		-e INPUT_SCHEMA=__tests__/mocks/schema/valid.json \
		-e INPUT_JSONS=__tests__/mocks/tested-data/valid.json \
		$(IMAGE_NAME):latest

# Test Invalid JSON (Should fail)
test-invalid: build
	@echo "\n--- Testing Invalid JSON (Expect Failure) ---"
	@if docker run --rm \
		-v $(PWD):/github/workspace \
		-e GITHUB_WORKSPACE=/github/workspace \
		-e INPUT_SCHEMA=__tests__/mocks/schema/valid.json \
		-e INPUT_JSONS=__tests__/mocks/tested-data/invalid_by_schema.json \
		$(IMAGE_NAME):latest; then \
		echo "Error: Action should have failed but passed."; exit 1; \
	else \
		echo "Success: Action failed as expected."; \
	fi

# Test Glob Patterns (Should fail because one file is invalid)
test-glob: build
	@echo "\n--- Testing Glob Patterns (Expect Failure) ---"
	@if docker run --rm \
		-v $(PWD):/github/workspace \
		-e GITHUB_WORKSPACE=/github/workspace \
		-e INPUT_SCHEMA=__tests__/mocks/schema/valid.json \
		-e INPUT_JSONS='__tests__/mocks/tested-data/*.json' \
		$(IMAGE_NAME):latest; then \
		echo "Error: Action should have failed but passed."; exit 1; \
	else \
		echo "Success: Action failed as expected."; \
	fi
