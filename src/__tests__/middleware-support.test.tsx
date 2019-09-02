import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import {
    testComponentWithPropsRegistration,
    TestComponentWithProps,
    testCompositionWithPropsRegistration,
} from './testComponents'
import { configure, mount } from 'enzyme'
import { LayoutRegistration } from '../LayoutRegistration'

configure({ adapter: new Adapter() })

it('can hook component middleware', () => {
    let middlewareCalled: any
    let middlewareProps: any
    let middlewareNext: any

    const ComponentRenderer = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentWithPropsRegistration)
                .registerMiddleware((_, mp: { skipRender?: boolean }, __, next) => {
                    middlewareCalled = true
                    middlewareProps = mp
                    middlewareNext = next

                    return null
                }),
        )
        .createComponentsRenderer()

    mount(
        <ComponentRenderer
            components={[{ type: 'testWithTitleProp', props: { title: 'test' }, skipRender: true }]}
            services={{}}
        />,
    )

    expect(middlewareCalled).toBe(true)
    expect(middlewareProps).toMatchObject({ skipRender: true })

    // Verify next() will actually render the component
    const renderOutput = mount(middlewareNext())

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('test')
})

it('can hook multiple component middleware', () => {
    let middlewareCalled: any
    let middleware2Called: any
    let middleware2Props: any
    let middleware2ComponentProps: any
    let middleware2Next: any
    const ComponentsRenderer = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentWithPropsRegistration)
                .registerMiddleware((props, _: { skipRender?: boolean }, services, next) => {
                    middlewareCalled = true
                    if (middleware2Called) {
                        throw new Error('middlewares called out of order')
                    }

                    return next({ ...props, additional: true }, _, services)
                })

                .registerMiddleware(
                    (componentProps, middlewareProps: { skipRender2?: boolean }, __, next) => {
                        middleware2Called = true
                        middleware2ComponentProps = componentProps
                        middleware2Props = middlewareProps
                        middleware2Next = next

                        return null
                    },
                ),
        )
        .createComponentsRenderer()

    mount(
        <ComponentsRenderer
            components={[
                { type: 'testWithTitleProp', props: { title: 'test' }, skipRender2: true },
            ]}
            services={{}}
        />,
    )

    expect(middlewareCalled).toBe(true)
    expect(middleware2Called).toBe(true)
    expect(middleware2Props).toMatchObject({ skipRender2: true })
    expect(middleware2ComponentProps).toMatchObject({ additional: true })

    // Verify next() will actually render the component
    const renderOutput1 = mount(middleware2Next())

    expect(renderOutput1.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput1.text()).toContain('test')

    // Verify next() will actually render the component
    const renderOutput = mount(middleware2Next({ title: 'Override' }))

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('Override')
})

it('can hook composition middleware', () => {
    let middlewareCalled: any
    let middlewareProps: any
    let middlewareNext: any

    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar.registerComponent(testComponentWithPropsRegistration),
        )
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionWithPropsRegistration)
                .registerMiddleware((_, mp: { skipRender?: boolean }, __, next) => {
                    middlewareCalled = true
                    middlewareProps = mp
                    middlewareNext = next

                    return null
                }),
        )

    mount(
        <layout.CompositionsRenderer
            compositions={[
                {
                    type: 'test-composition-with-props',
                    contentAreas: {
                        main: [{ type: 'testWithTitleProp', props: { title: 'Component title' } }],
                    },
                    props: { compositionTitle: 'Composition title' },
                    skipRender: true,
                },
            ]}
            services={{}}
        />,
    )

    expect(middlewareCalled).toBe(true)
    expect(middlewareProps).toMatchObject({ skipRender: true })

    // Verify next() will actually render the component
    const renderOutput = mount(middlewareNext())

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('Component title')
    expect(renderOutput.text()).toContain('Composition title')
})

it('can hook multiple composition middleware', () => {
    let middlewareCalled: any
    let middleware2Called: any
    let middleware2Props: any
    let middleware2ComponentProps: any
    let middleware2Next: any

    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar.registerComponent(testComponentWithPropsRegistration),
        )
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionWithPropsRegistration)
                .registerMiddleware((props, _: { skipRender?: boolean }, services, next) => {
                    middlewareCalled = true
                    if (middleware2Called) {
                        throw new Error('middlewares called out of order')
                    }

                    return next({ ...props, additional: true }, _, services)
                })

                .registerMiddleware(
                    (componentProps, middlewareProps: { skipRender2?: boolean }, __, next) => {
                        middleware2Called = true
                        middleware2ComponentProps = componentProps
                        middleware2Props = middlewareProps
                        middleware2Next = next

                        return null
                    },
                ),
        )

    mount(
        <layout.CompositionsRenderer
            compositions={[
                {
                    type: 'test-composition-with-props',
                    contentAreas: {
                        main: [{ type: 'testWithTitleProp', props: { title: 'Component title' } }],
                    },
                    props: { compositionTitle: 'Composition title' },
                    skipRender2: true,
                },
            ]}
            services={{}}
        />,
    )

    expect(middlewareCalled).toBe(true)
    expect(middleware2Called).toBe(true)
    expect(middleware2Props).toMatchObject({ skipRender2: true })
    expect(middleware2ComponentProps).toMatchObject({ additional: true })

    // Verify next() will actually render the component
    const renderOutput1 = mount(middleware2Next())

    expect(renderOutput1.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput1.text()).toContain('Composition title')

    // Verify next() will actually render the component
    const renderOutput = mount(middleware2Next({ compositionTitle: 'Override' }))

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('Override')
})
