# JSON React layouts data loader

[![npm](https://img.shields.io/npm/v/json-react-layouts-data-loader)](https://www.npmjs.com/package/json-react-layouts-data-loader)

Component middleware for JSON React layouts which enables data loading via the [React SSR Data Loader](https://www.npmjs.com/package/react-ssr-data-loader) library.

## Usage

```ts
import { init } from 'json-react-layouts-data-loader'
import { DataLoaderResources, DataProvider } from 'react-ssr-data-loader'

interface MyServices {
    // Put the services you want available to components
}

const resources = new DataLoaderResources<MyServices>()
const { middleware, createRegisterableComponentWithData } = init<MyServices>(resources)

const componentRegistrar = new ComponentRegistrar()
    // Register your components, then register the component data loading middleware
    .registerMiddleware(middleware)

export const testComponentWithDataRegistration = createRegisterableComponentWithData(
    'test-with-data',
    {
        // You provide this function to load the data
        loadData: props => {},
    },
    (props, data) => {
        if (!data.loaded) {
            return <div>Loading...</div>
        }

        return <TestComponentWithData data={data.result} />
    },
)
```

## FAQ

### My data load function references global variables and does not update when they change

If you reference global variables in your data load function the data will not be re-fetched when that variable changes. This is because the data loader assumes if the arguments are the same, the result of the load function will be the same as the current data and do nothing.

You can use the `useRuntimeParams` function to merge additional varibles to the data loader props when it re-renders so it can fetch the updated data as expected. For example if you had state stored in redux.

React hooks are supported inside this function.

```ts
import { init } from 'json-react-layouts-data-loader'
import { DataLoaderResources, DataProvider } from 'react-ssr-data-loader'

export const testComponentWithDataRegistration = createRegisterableComponentWithData(
    'test-with-data',
    {
        getRuntimeParams: (props, services) => services.store.getState().myAdditionalState
        // You provide this function to load the data
        loadData: props => {
            // Now the global state is visible to the data loader and will make up the cache key so changes to myAdditionalState will cause the data to be re-loaded
            props.myAdditionalState
        },
    },
    (props, data) => {
        if (!data.loaded) {
            return <div>Loading...</div>
        }

        return <TestComponentWithData data={data.result} />
    },
)
```
