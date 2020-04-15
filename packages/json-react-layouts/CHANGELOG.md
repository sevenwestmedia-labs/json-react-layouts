# json-react-layouts

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
