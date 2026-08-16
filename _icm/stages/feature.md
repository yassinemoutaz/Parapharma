# Feature Stage

## When This Stage Applies
A new capability or behavior is added to the project.

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
Update the ICM documentation when the feature affects:

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

For trivial changes (CSS adjustment, text correction, isolated UI change), do not modify architectural documentation unless necessary.

## Architectural Decisions
If the feature introduces an important architectural decision, create or update an ADR in /_icm/decisions/ using /_icm/decisions/NNN-short-description.md.

Never silently introduce a new architectural pattern.