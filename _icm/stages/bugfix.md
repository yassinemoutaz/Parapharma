# Bugfix Stage

## When This Stage Applies
A defect or unexpected behavior is corrected.

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
A small bugfix with no architectural impact does not require documentation changes.

Update the ICM documentation when the fix affects:

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
If the fix changes how the system is structured or how data flows, record the decision in an ADR in /_icm/decisions/ using /_icm/decisions/NNN-short-description.md.