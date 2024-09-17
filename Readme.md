# PHOGA

PHOGA is a project of PHOto GAllery intended to have separate back end and front end. The present project is the back-end component which is basically a RESTful API for CRUD operations on photos (images + metadata).

## Preamble

### Mainspring

The truth behind this project is that it is actually a playground for the author to discover and play with some development concepts such as Test Driven Development (TDD), Clean Architecture and unfamiliar tools (Docker, ...).

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
npm run test:unit // -- --verbose (for details)
```

### Integration tests

1. Duplicate the file `docker\tests\.env.demo` and rename it `.env`.

2. Start Docker Desktop.

3. Run the following command (_note that the first launch might take some time as some Docker images will be downloaded_):

```bash
npm run test:int // -- --verbose (for details)
```

### E2E tests

Not implemented yet.
