# json-react-layouts

## 3.0.0-beta.9

### Minor Changes

-   c3d964b: Switched typescript-log to use debug package, see readme for how to enable debug logging

## 3.0.0-beta.8

### Patch Changes

-   de1994c: Fixed crash when using hooks inside useRuntimeParams

## 3.0.0-beta.7

### Patch Changes

-   ddf9a2e: Fixed issue where middleware is violating the rules of hooks

## 3.0.0-beta.6

### Minor Changes

-   9a6621d: Upgraded dependencies

## 3.0.0-beta.5

### Minor Changes

-   885b1fa: Add ability for a composition to provide additional props to all components rendered inside it

    This opens up the possibility of compositions to pass width ratio information down to children, enabling sorta container queries

## 3.0.0-beta.4

### Patch Changes

-   Restore default generic param for DataDefinition type

## 3.0.0-beta.3

### Patch Changes

-   Allow checked composition to be used as a nested composition

## 3.0.0-beta.2

### Patch Changes

-   1207d38: Simplified types further

## 3.0.0-beta.1

### Patch Changes

-   0083a12: Each component and composition must be wrapped in a layout.component() or layout.composition()

    This is because TypeScript does not yet support variadic types, meaning we can't accurately enforce the types on a ...rest style function.

    Before:

    ```
    {
        type: 'test-composition',
        contentAreas: {
            main: [
                {
                    type: 'test-with-data',
                    props: { dataDefinitionArgs: { dataArg: 'Foo' } },
                },
            ],
        },
        props: {},
    }
    ```

    After:

    ```
    layout.composition({
        type: 'test-composition',
        contentAreas: {
            main: [
                layout.component({
                    type: 'test-with-data',
                    props: { dataDefinitionArgs: { dataArg: 'Foo' } },
                }),
            ],
        },
        props: {},
    })
    ```

## 3.0.0-beta.0

### Major Changes

-   Restructured public API slightly to reduce bundle size and type complexity
