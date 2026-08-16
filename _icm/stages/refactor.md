# Refactor Stage

## When This Stage Applies
Existing code or structure is reorganized without adding new external behavior.

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
Refactoring often changes folder structure, module responsibilities, or data flow. Update the ICM documentation whenever the refactor changes:

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

Never make the code conform to documentation merely because the documentation is outdated. If documentation and code disagree:

1. identify the discrepancy
2. determine the correct source of truth
3. resolve the inconsistency
4. update the documentation

## Architectural Decisions
If the refactor introduces an important architectural decision, create or update an ADR in /_icm/decisions/ using /_icm/decisions/NNN-short-description.md.