---
'json-react-layouts-data-loader': patch
'json-react-layouts': patch
---

Each component and composition must be wrapped in a layout.component() or layout.composition()

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
