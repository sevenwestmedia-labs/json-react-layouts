# JSON React layouts

JSON React layouts enables registration of components and layouts (called compositions) to open up the possibilities of pages where the layout is driven by data.

Ever wanted to allow your users to customise the layout of a page? This library solves that type of problem.

## Why

React is great for building web applications, but sometimes using React directly for websites can lead to a bunch of higher order components, hooks or helper functions which you need to use on every page route.

JSON React layouts makes it easier to solve all the cross cutting concerns which pop up in a nice centrally managed way. It also opens up the possibility of CMS managing page layouts because pages are written as plain JS objects.

## Goals

-   Pages are just plain objects, so they can be serialised or come from a server (to enable CMS managed layouts)
-   Can enable capabilities for all pages / components in a cross cutting way
-   Type safety on the component definitions

## Example

Once we have registered a `header`, `blog-entry` and `ad` component, our page definition could look like this:

```tsx
const definition = layout.compositions([
    {
        type: '50-50-layout',
        contentAreas: {
            left: [
                {
                    type: 'header',
                    props: {
                        text: 'My page header',
                    },
                },
                {
                    type: 'blog-entry',
                    props: {
                        id: 1,
                    },
                },
            ],

            right: [
                {
                    type: 'ad',
                    props: {
                        size: 'mrec',
                    },
                },
            ],
        },
    },
])

const renderer = layout.createRenderer({ services: {} })

// Now we can get json-react-layouts to render that definition:

renderer.renderCompositions(definition)
```

## Terminology

### Components

The lowest building block, you create a registration which takes the properties in the route declaration and renders a React component.

### Compositions

They could also be called layouts, they have content areas which can contain components

## Getting started

### Registering components & compositions

The first step is to create a component registration. It needs a key, which you can use in the route definitions when rendering.

To ensure your components have the correct type for the component services getting the createRegistration functions is a two step process. This is due to limitations in TypeScripts generic arguments where you cannot mix specified and inferred generics.

```ts
const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<
    MyServices
>()

export const myComponentRegistration = createRegisterableComponent('component-key', () => (
    <MyComponent />
))

export const testCompositionRegistration = createRegisterableComposition<
    'main'
>()('test-composition-with-props', (contentAreas, props: { myProp: string }) => (
    <TestComposition main={contentAreas.main} myProp={props.myProp} />
))

// Create your `LayoutRegistration` then register your components
const layout = LayoutRegistration()
    .registerComponents(registrar =>
        registrar
            .registerComponent(myComponentRegistration)
            .registerComponent(myComponentRegistration2),
    )
    // Then compositions
    .registerCompositions(registrar =>
        registrar
            .registerComposition(testCompositionRegistration)
            .registerComposition(testCompositionRegistration2),
    )
```

## Types information

When you have lot's of components TypeScript may just give up type checking, so the route builder has a number of helpers to help keep things type safe and narrow down any typing errors.

### Helper functions

These functions just return what you pass them, but are useful to narrow a compilation error down.

These two examples are the same

```ts
// Example 1
const definition = layout.compositions( // This is where your compilation error will be
    {
        type: '50-50-layout',
        contentAreas: {
            left: [
                {
                    type: 'header',
                    props: {
                        tet: 'My page header' // This is wrong
                    }
                },
                { type: 'blog-entry', props: { id: 1 } }
            ],=
            right: [
                { type: 'ad', props: { size: 'mrec' } }
            ]
        }
    }
)

// Example 2
const definition = layout.compositions([
    {
        type: '50-50-layout',
        contentAreas: {
            left: [
                layout.component({ // This is where your compilation error will be
                    type: 'header',
                    props: {
                        tet: 'My page header' // This is wrong
                    }
                }),
                { type: 'blog-entry', props: { id: 1 } }
            ],
            right: [
                { type: 'ad', props: { size: 'mrec' }
            ]
        }
    }
)
```

As you can see, you can use the helper functions to narrow type errors. They are also handy for extracting components into multiple variables.

```ts
const header = layout.component({
    type: 'header',
    props: {
        text: 'My page header',
    },
})
```

### Type helpers

If you do not want to use the helper functions you can use the type helpers to get the type aliases for your component/composition types. These properties do not have values, they are just available to use the `typeof` keyword.

```ts
const header: typeof layout._componentType = {
    type: 'header',
    props: {
        text: 'My page header',
    },
}

const header: typeof layout._compositionType = {
    type: '50-50-layout',
    contentAreas: {
        left: [],
        right: [],
    },
}
```

## Middleware

JSON React Layouts allows you to add middlewares around component rendering, this makes it really easy to add capabilities to all components being rendered. This could be feature toggling, data loading and pretty much anything you can think of.

For example, if you wanted to expose a skip render property on all components you could write a middleware which looked like this:

```ts
LayoutRegistration().registerComponents(registrar =>
    registrar
        .registerComponent(myComponentRegistration)
        .registerMiddleware(
            (componentProps, middlewareProps: { skipRender?: boolean }, services, next) => {
                if (middlewareProps.skipRender) {
                    return null
                }

                return next(componentProps, middlewareProps, services)
            },
        ),
)
```

Middlewares can also be applied to compositions.

## Debug Logging

JSON React Layouts has debug logging available if you want it. We use the NPM package [debug](https://www.npmjs.com/package/debug) for this.

### In browser

Set `localStorage.debug = 'json-react-layout:*'` for instance. Then refresh

### In node

Set DEBUG="json-react-layout:\*"

### Available debug scopes

`json-react-layout:compositions`
`json-react-layout:composition`
`json-react-layout:component`
`json-react-layout:middleware`
