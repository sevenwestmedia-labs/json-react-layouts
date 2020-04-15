import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import {
    testComponentWithPropsRegistration,
    TestComponentWithProps,
    testCompositionWithPropsRegistration,
} from './testComponents'
import { configure, mount, render } from 'enzyme'
import { LayoutRegistration } from '../LayoutRegistration'
import { getRegistrationCreators } from '../get-registration-creators'
import { ComponentsRenderer } from '../renderers/components-renderer'
import { CompositionsRenderer } from '../renderers/compositions-renderer'
import { ComponentRenderer } from '../renderers/component-renderer'

configure({ adapter: new Adapter() })

const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<{}>()

it('can hook component middleware', () => {
    let middlewareCalled: any
    let middlewareProps: any

    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentWithPropsRegistration)
                .registerMiddleware((cp, mp: { skipRender?: boolean }, ms, next) => {
                    middlewareCalled = true
                    middlewareProps = mp

                    return next(cp, mp, ms)
                }),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionWithPropsRegistration),
        )

    const renderer = layout.createRenderers({ services: {} })

    const renderOutput = mount(
        renderer.renderComponents(
            layout.component({
                type: 'testWithTitleProp',
                props: { title: 'test' },
                skipRender: true,
            }),
        ),
    )

    expect(middlewareCalled).toBe(true)
    expect(middlewareProps).toMatchObject({ skipRender: true })

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('test')
})

it('can hook multiple component middleware', () => {
    let middlewareCalled: any
    let middleware2Called: any
    let middleware2Props: any
    let middleware2ComponentProps: any
    let middleware2Services: any
    let componenentServices: any

    const layout = LayoutRegistration<{ serviceValue: boolean }>()
        .registerComponents(registrar =>
            registrar
                .registerComponent(
                    createRegisterableComponent(
                        'testWithTitleProp',
                        (props: { title: string }, services) => {
                            componenentServices = services
                            return <TestComponentWithProps title={props.title} />
                        },
                    ),
                )
                .registerMiddleware((props, _: { skipRender?: boolean }, services, next) => {
                    middlewareCalled = true
                    if (middleware2Called) {
                        throw new Error('middlewares called out of order')
                    }

                    return next({ ...props, additional: true }, _, {
                        ...services,
                        services: { serviceValue: true },
                    })
                })

                .registerMiddleware(
                    (
                        componentProps,
                        middlewareProps: { skipRender2?: boolean },
                        services,
                        next,
                    ) => {
                        middleware2Called = true
                        middleware2ComponentProps = componentProps
                        middleware2Props = middlewareProps
                        middleware2Services = services

                        return next(
                            middleware2ComponentProps,
                            middleware2Props,
                            middleware2Services,
                        )
                    },
                ),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionWithPropsRegistration),
        )
    const renderers = layout.createRenderers({ services: { serviceValue: false } })

    const renderOutput1 = mount(
        renderers.renderComponents(
            layout.component({
                type: 'testWithTitleProp',
                props: { title: 'test' },
                skipRender2: true,
            }),
        ),
    )

    expect(middlewareCalled).toBe(true)
    expect(middleware2Called).toBe(true)
    expect(middleware2Props).toMatchObject({ skipRender2: true })
    expect(middleware2ComponentProps).toMatchObject({ additional: true })

    expect(middleware2Services).toMatchObject({ services: { serviceValue: true } })
    expect(componenentServices).toMatchObject({ serviceValue: true })

    expect(renderOutput1.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput1.text()).toContain('test')
})

it('can hook composition middleware', () => {
    let middlewareCalled: any
    let middlewareProps: any
    let middlewareNext: any

    const layout = LayoutRegistration()
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
    const renderers = layout.createRenderers({ services: {} })

    mount(
        renderers.renderCompositions(
            layout.composition({
                type: 'test-composition-with-props',
                contentAreas: {
                    main: [
                        layout.component({
                            type: 'testWithTitleProp',
                            props: { title: 'Component title' },
                        }),
                    ],
                },
                props: { compositionTitle: 'Composition title' },
                skipRender: true,
            }),
        ),
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
    let middleware2Service: any

    const layout = LayoutRegistration<{ serviceAvailable: boolean }>()
        .registerComponents(registrar =>
            registrar.registerComponent(testComponentWithPropsRegistration),
        )
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionWithPropsRegistration)
                .registerMiddleware<{ skipRender?: boolean }>((props, _, services, next) => {
                    middlewareCalled = true
                    if (middleware2Called) {
                        throw new Error('middlewares called out of order')
                    }

                    return next({ ...props, additional: true }, _, {
                        ...services,
                        services: { serviceAvailable: true },
                    })
                })

                .registerMiddleware<{ skipRender2?: boolean }>(
                    (componentProps, middlewareProps, service, next) => {
                        middleware2Called = true
                        middleware2ComponentProps = componentProps
                        middleware2Props = middlewareProps
                        middleware2Next = next
                        middleware2Service = service

                        return null
                    },
                ),
        )
    const renderers = layout.createRenderers({ services: { serviceAvailable: false } })

    mount(
        renderers.renderCompositions(
            layout.composition({
                type: 'test-composition-with-props',
                contentAreas: {
                    main: [
                        layout.component({
                            type: 'testWithTitleProp',
                            props: { title: 'Component title' },
                        }),
                    ],
                },
                props: { compositionTitle: 'Composition title' },
                skipRender2: true,
            }),
        ),
    )

    expect(middlewareCalled).toBe(true)
    expect(middleware2Called).toBe(true)
    expect(middleware2Props).toMatchObject({ skipRender2: true })
    expect(middleware2ComponentProps).toMatchObject({ additional: true })
    expect(middleware2Service).toMatchObject({ services: { serviceAvailable: true } })

    // Verify next() will actually render the component
    const renderOutput1 = mount(middleware2Next())

    expect(renderOutput1.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput1.text()).toContain('Composition title')

    // Verify next() will actually render the component
    const renderOutput = mount(middleware2Next({ compositionTitle: 'Override' }))

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('Override')
})
