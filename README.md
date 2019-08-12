# React json page layout

React json page layout enables registration of components and layouts (called compositions) to open up the possibilities of pages where the layout is driven by data.

## Why

React is great for building web applications, but sometimes using React directly for websites can lead to a bunch of higher order components, hooks or helper functions which you need to use on every page route.

React pages makes it easier to solve all the cross cutting concerns which pop up in a nice centrally managed way. It also opens up the possibility of CMS managing page layouts because pages are written as plain JS objects.

## Goals

-   Pages are just plain objects, so they can be serialised or come from a server (to enable CMS managed layouts)
-   Can enable capabilities for all pages / components in a cross cutting way
-   Type safety on the component definitions

## Example

Once we have registered a `header`, `blog-entry` and `ad` component, our page definition could look like this:

```tsx
const definition = routeBuilder.page([
    type: '50-50-layout',
    contentAreas: {

        left: [
            {
                type: 'header',
                props: {
                    text: 'My page header'
                }
            },
            {
                type: 'blog-entry',
                props: {
                    id: 1
                }
            }
        ],

        right: [
            {
                type: 'ad',
                props: {
                    size: 'mrec'
                }
            }
        ]
    }
])

// Now we can get react-pages to render that definition:

<routeBuilder.PageRenderer
    compositions={definition}
/>
```

## Terminology

### Components

The lowest building block, you create a registration which takes the properties in the route declaration and renders a React component.

### Compositions

They could also be called layouts, they have content areas which can contain components

## Getting started

### Registering components

The first step is to create a component registration. It needs a key, which you can use in the route definitions when rendering.

```ts
export const myComponentRegistration = createRegisterableComponent('component-key', () => (
    <MyComponent />
))

// Create your `ComponentRegistrar` then register your components.
const componentRegistrar = new ComponentRegistrar().register(myComponentRegistration)
```

### Registering compositions

```ts
const compositionRegistrar = CompositionRegistrar.create(componentRegistrar).registerComposition(
    testCompositionRegistration,
)
```

### Create the route builder

The route builder is the main type you will deal with, it has helpers to create type safe type definitions then render those definitions.

```ts
const routeBuilder = new RouteBuilder(compositionRegistrar)
```
