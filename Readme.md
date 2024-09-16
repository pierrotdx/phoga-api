# PHOGA

PHOGA is a project of PHOto GAllery intended to have separate back end and front end. The present project is the back-end component which is basically a RESTful API for CRUD operations on photos (images + metadata).

## Preamble

### Mainspring

The truth behind this project is that it is actually a playground for the author to discover and play with some development concepts such as Test Driven Development (TDD), Clean Architecture and tools (Docker, ...).

As such, some choices of architecture or libraries are not based on efficiency but rather on the sake of discovery or simplicity, depending on the case.

### Current state

The API is still under development and not ready for production.

## Dependencies

```bash
npm install
```

## Running tests

### Unit tests

```bash
npm run test:unit
```

### Integration tests

Integration tests should be working if Docker is running locally. The first launch might take some time as Docker images need to be downloaded.

```bash
npm run test:int
```

### E2E tests

Not implemented yet.
