# API Stage

## When This Stage Applies
An interface between systems is created or changed. This includes:

- new or modified endpoints
- new or changed contracts between frontend and backend
- new or changed external service integrations
- new or changed public interfaces

## Process

1. Read IDENTITY.md
2. Read CONTEXT.md
3. Read ROUTING.md
4. Analyze the existing project
5. Identify affected files
6. Identify affected architecture
7. Implement the change
8. Update documentation when necessary
9. Verify that code and documentation remain consistent

## Documentation Synchronization
API changes affect data flow and module responsibilities. Update the ICM documentation when the change affects:

- architecture
- folder structure
- module responsibilities
- data flow
- database structure
- authentication
- security
- external services
- deployment
- important development conventions

## Architectural Decisions
If the API change introduces an important architectural decision (contract design, versioning strategy, integration pattern), create or update an ADR in /_icm/decisions/ using /_icm/decisions/NNN-short-description.md.