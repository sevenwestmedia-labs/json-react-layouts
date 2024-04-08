import React from 'react'
import { act } from 'react-dom/test-utils'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { init } from '.'
import { DataDefinition } from './DataLoading'
import { DataLoaderResources, DataProvider } from 'react-ssr-data-loader'
import { getRegistrationCreators, LayoutRegistration } from 'json-react-layouts'
import { mount, configure } from 'enzyme'

configure({ adapter: new Adapter() })

it('can load data for component', async () => {
    const resources = new DataLoaderResources<{}>()
    const { getMiddleware, createRegisterableComponentWithData } = init<{}>(resources)

    const testComponentWithDataRegistration = createRegisterableComponentWithData(
        'test-with-data',
        lengthCalculatorDataDefinition,
        (props, data) => {
            return (
                <TestComponentWithData
                    length={data.loaded ? data.result : undefined}
                    {...props}
                    {...{ dataProps: { data } }}
                />
            )
        },
    )

    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentWithDataRegistration)
                .registerMiddleware(getMiddleware('component')),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )
    const renderers = layout.createRenderers({
        services: {},
    })

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            {renderers.renderCompositions(
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
                }),
            )}
        </DataProvider>,
    )

    expect(wrapper.find(TestComponentWithData).text()).toBe('Loading')
    await act(() => new Promise(resolve => setTimeout(resolve)))

    const component = wrapper.update().find(TestComponentWithData)
    expect(component.text()).toBe('Length: 3')
    expect(component.props()).toMatchSnapshot()
})

it('can load data for composition', async () => {
    const resources = new DataLoaderResources<{}>()
    const { getMiddleware, createRegisterableCompositionWithData } = init<{}>(resources)

    const testCompositionWithDataRegistration = createRegisterableCompositionWithData<'main'>()(
        'test-with-data',
        lengthCalculatorDataDefinition,
        ({ main }, props, data) => {
            return (
                <TestCompositionWithData
                    main={main}
                    length={data.loaded ? data.result : undefined}
                    {...props}
                    {...{ dataProps: { data } }}
                />
            )
        },
    )

    const layout = LayoutRegistration()
        .registerComponents(registrar => registrar.registerComponent(testComponentRegistration))
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionWithDataRegistration)
                .registerMiddleware(getMiddleware('composition')),
        )
    const renderers = layout.createRenderers({
        services: {},
    })

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            {renderers.renderCompositions(
                layout.composition({
                    type: 'test-with-data',
                    contentAreas: {
                        main: [
                            layout.component({
                                type: 'test-component',
                                props: {},
                            }),
                        ],
                    },
                    props: { dataDefinitionArgs: { dataArg: 'Foo' } },
                }),
            )}
        </DataProvider>,
    )

    expect(wrapper.find(TestCompositionWithData).text()).toBe('Loading#TestComponent#')
    await act(() => new Promise(resolve => setTimeout(resolve)))

    const composition = wrapper.update().find(TestCompositionWithData)
    expect(composition.text()).toBe('Length: 3#TestComponent#')
    expect(composition.props()).toMatchSnapshot()
})

it('cap wrap data load function', async () => {
    let wrapArgs: any
    let wrapServices: any
    let wrapContext: any
    const resources = new DataLoaderResources<{ serviceProp: 'example' }>()
    const { getMiddleware, createRegisterableComponentWithData } = init<{ serviceProp: 'example' }>(
        resources,
        load => (args, services, context) => {
            wrapArgs = args
            wrapServices = services
            wrapContext = context
            return load(args, services, context)
        },
    )

    const testComponentWithDataRegistration = createRegisterableComponentWithData(
        'test-with-data',
        lengthCalculatorDataDefinition,
        (props, data) => {
            return (
                <TestComponentWithData
                    length={data.loaded ? data.result : undefined}
                    {...props}
                    {...{ dataProps: { data } }}
                />
            )
        },
    )

    const layout = LayoutRegistration<{ serviceProp: 'example' }>()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentWithDataRegistration)
                .registerMiddleware(getMiddleware('component')),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const renderers = layout.createRenderers({
        services: { serviceProp: 'example' },
    })

    mount(
        <DataProvider resources={resources} globalProps={{ serviceProp: 'example' }}>
            {renderers.renderCompositions(
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
                }),
            )}
        </DataProvider>,
    )

    expect(wrapArgs).toEqual({ dataArg: 'Foo' })
    expect(wrapServices).toEqual({ serviceProp: 'example' })
    expect(wrapContext).toEqual({
        paramsCacheKey: '7c4bd5d4',
        resourceType: 'component-data-loader',
    })
})

it('component can provide additional arguments dynamically', async () => {
    const resources = new DataLoaderResources<{}>()
    const { getMiddleware, createRegisterableComponentWithData } = init<{}>(resources)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let updateMultiplier: (multiplier: number) => void = () => {}

    const lengthCalculatorWithMultiplierDataDefinition: DataDefinition<
        { dataArg: string },
        number,
        {},
        { multiplier: number }
    > = {
        // Additional params can come from anywhere, for instance redux or
        // other environmental variables (window.location?)
        useRuntimeParams: () => {
            const [multiplier, setMultiplier] = React.useState(2)
            React.useEffect(() => {
                updateMultiplier = setMultiplier
            }, [])

            return {
                multiplier,
            }
        },
        loadData: props =>
            new Promise(resolve =>
                setTimeout(() => {
                    resolve(props.dataArg.length * props.multiplier)
                }),
            ),
    }

    const testComponentWithDataRegistration = createRegisterableComponentWithData(
        'test-with-data',
        lengthCalculatorWithMultiplierDataDefinition,
        (props, data) => {
            return (
                <TestComponentWithData
                    length={data.loaded ? data.result : undefined}
                    {...props}
                    {...{ dataProps: { data } }}
                />
            )
        },
    )

    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentWithDataRegistration)
                .registerMiddleware(getMiddleware('component')),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const renderers = layout.createRenderers({
        services: {},
    })

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            {renderers.renderCompositions(
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
                }),
            )}
        </DataProvider>,
    )

    await act(() => new Promise(resolve => setTimeout(resolve)))

    let component = wrapper.update().find(TestComponentWithData)
    expect(component.text()).toBe('Length: 6')
    expect(component.props()).toMatchObject({
        dataProps: {
            data: {
                dataDefinitionArgs: { dataArg: 'Foo', multiplier: 2 },
            },
        },
    })

    act(() => {
        updateMultiplier(3)
    })
    await act(() => new Promise(resolve => setTimeout(resolve)))

    component = wrapper.update().find(TestComponentWithData)
    expect(component.text()).toBe('Length: 9')
    expect(component.props()).toMatchObject({
        dataProps: {
            data: {
                dataDefinitionArgs: { dataArg: 'Foo', multiplier: 3 },
            },
        },
    })
})

it('composition can provide additional arguments dynamically', async () => {
    const resources = new DataLoaderResources<{}>()
    const { getMiddleware, createRegisterableCompositionWithData } = init<{}>(resources)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let updateMultiplier: (multiplier: number) => void = () => {}

    const lengthCalculatorWithMultiplierDataDefinition: DataDefinition<
        { dataArg: string },
        number,
        {},
        { multiplier: number }
    > = {
        // Additional params can come from anywhere, for instance redux or
        // other environmental variables (window.location?)
        useRuntimeParams: () => {
            const [multiplier, setMultiplier] = React.useState(2)
            React.useEffect(() => {
                updateMultiplier = setMultiplier
            }, [])

            return {
                multiplier,
            }
        },
        loadData: props =>
            new Promise(resolve =>
                setTimeout(() => {
                    resolve(props.dataArg.length * props.multiplier)
                }),
            ),
    }

    const testCompositionWithDataRegistration = createRegisterableCompositionWithData<'main'>()(
        'test-with-data',
        lengthCalculatorWithMultiplierDataDefinition,
        ({ main }, props, data) => {
            return (
                <TestCompositionWithData
                    main={main}
                    length={data.loaded ? data.result : undefined}
                    {...props}
                    {...{ dataProps: { data } }}
                />
            )
        },
    )

    const layout = LayoutRegistration()
        .registerComponents(registrar => registrar.registerComponent(testComponentRegistration))
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionWithDataRegistration)
                .registerMiddleware(getMiddleware('composition')),
        )

    const renderers = layout.createRenderers({
        services: {},
    })

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            {renderers.renderCompositions(
                layout.composition({
                    type: 'test-with-data',
                    contentAreas: {
                        main: [
                            layout.component({
                                type: 'test-component',
                                props: {},
                            }),
                        ],
                    },
                    props: {
                        dataDefinitionArgs: {
                            dataArg: 'Foo',
                        },
                    },
                }),
            )}
        </DataProvider>,
    )

    await act(() => new Promise(resolve => setTimeout(resolve)))

    let composition = wrapper.update().find(TestCompositionWithData)
    expect(composition.text()).toBe('Length: 6#TestComponent#')
    expect(composition.props()).toMatchObject({
        dataProps: {
            data: {
                dataDefinitionArgs: { dataArg: 'Foo', multiplier: 2 },
            },
        },
    })

    act(() => {
        updateMultiplier(3)
    })
    await act(() => new Promise(resolve => setTimeout(resolve)))

    composition = wrapper.update().find(TestCompositionWithData)
    expect(composition.text()).toBe('Length: 9#TestComponent#')
    expect(composition.props()).toMatchObject({
        dataProps: {
            data: {
                dataDefinitionArgs: { dataArg: 'Foo', multiplier: 3 },
            },
        },
    })
})

const TestComponent: React.FC = () => <div>#TestComponent#</div>

const TestComponentWithData: React.FC<{ length: number | undefined }> = ({ length }) => (
    <div>{length ? `Length: ${length}` : 'Loading'}</div>
)

const TestComposition: React.FC<{ main: React.ReactElement<any> }> = props => (
    <div>{props.main}</div>
)

const TestCompositionWithData: React.FC<{
    main: React.ReactElement<any>
    length: number | undefined
}> = ({ length, main }) => (
    <div>
        <div>{length ? `Length: ${length}` : 'Loading'}</div>
        {main}
    </div>
)

const { createRegisterableComposition, createRegisterableComponent } = getRegistrationCreators<{}>()
const testCompositionRegistration = createRegisterableComposition<'main'>()(
    'test-composition',
    contentAreas => <TestComposition main={contentAreas.main} />,
)

const testComponentRegistration = createRegisterableComponent('test-component', () => (
    <TestComponent />
))

const lengthCalculatorDataDefinition: DataDefinition<{ dataArg: string }, number, {}, {}> = {
    loadData: props =>
        new Promise(resolve =>
            setTimeout(() => {
                resolve(props.dataArg.length)
            }),
        ),
}
