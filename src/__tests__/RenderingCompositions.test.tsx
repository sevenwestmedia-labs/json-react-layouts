import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, mount } from 'enzyme'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
    TestComponent,
    TestComponent2,
    TestComposition,
    testCompositionWithPropsRegistration,
} from './testComponents'
import { LayoutRegistration } from '../LayoutRegistration'
import { getRegistrationCreators } from '../get-registration-creators'
import { ComponentRenderer } from '../ComponentRenderer'

configure({ adapter: new Adapter() })

it('can render a composition with a content area through the registrar', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const wrapper = mount(
        <layout.CompositionsRenderer
            services={{}}
            compositions={[
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: { main: [{ type: 'test', props: {} }] },
                },
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: {
                        main: [{ type: 'test', props: {} }, { type: 'test2', props: {} }],
                    },
                },
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: { main: [{ type: 'test2', props: {} }] },
                },
            ]}
        />,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(2)
    expect(wrapper.find(TestComponent2)).toHaveLength(2)
    expect(wrapper.find(TestComposition)).toHaveLength(3)
})

it('content area renderer uses renderKey if specified', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const wrapper = mount(
        <layout.CompositionsRenderer
            services={{}}
            compositions={[
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: {
                        main: [{ type: 'test', props: {}, renderKey: 'custom-render-key' }],
                    },
                },
            ]}
        />,
    )

    expect(wrapper.find(ComponentRenderer).key()).toBe('custom-render-key')
})

it('compositions renderer uses renderKey if specified', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const wrapper = mount(
        <layout.CompositionsRenderer
            services={{}}
            compositions={[
                {
                    type: 'test-composition',
                    props: {},
                    renderKey: 'custom-render-key',
                    contentAreas: {
                        main: [{ type: 'test', props: {} }],
                    },
                },
            ]}
        />,
    )

    expect(wrapper.find('CompositionRenderer').key()).toBe('custom-render-key')
})

it('compositions renderer uses index if renderKey not specified', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const wrapper = mount(
        <layout.CompositionsRenderer
            services={{}}
            compositions={[
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: {
                        main: [{ type: 'test', props: {} }],
                    },
                },
            ]}
        />,
    )

    expect(wrapper.find('CompositionRenderer').key()).toBe('0')
})

it('can render a composition with props', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionWithPropsRegistration),
        )

    const wrapper = mount(
        <layout.CompositionsRenderer
            services={{}}
            compositions={[
                {
                    type: 'test-composition-with-props',
                    props: { compositionTitle: 'Composition title' },
                    contentAreas: { main: [{ type: 'test', props: {} }] },
                },
            ]}
        />,
    )

    expect(wrapper.find(TestComposition).props()).toMatchObject({
        compositionTitle: 'Composition title',
    })
})

it('can render a nested composition', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar => registrar.registerComponent(testComponentRegistration))
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const wrapper = mount(
        <div>
            <layout.CompositionsRenderer
                services={{}}
                compositions={[
                    {
                        type: 'test-composition',
                        props: {},
                        contentAreas: {
                            main: [
                                // This is how you make a nested composition work
                                layout.nestedComposition({
                                    type: 'test-composition',
                                    props: {},
                                    contentAreas: { main: [{ type: 'test', props: {} }] },
                                }),
                            ],
                        },
                    },
                ]}
            />
        </div>,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(1)
})

it('gets services', () => {
    interface ExampleServices {
        example: string
    }
    const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<
        ExampleServices
    >()

    let capturedComponentServices: ExampleServices | undefined = undefined
    let capturedCompositionServices: ExampleServices | undefined = undefined

    const componentCaptureServices = createRegisterableComponent('test', (_, services) => {
        capturedComponentServices = services
        return null
    })

    const compositionCaptureServices = createRegisterableComposition<'main'>()(
        'test',
        (contentArea, __, services) => {
            capturedCompositionServices = services
            return <div>{contentArea.main}</div>
        },
    )

    const layout = new LayoutRegistration<ExampleServices>()
        .registerComponents(registrar => registrar.registerComponent(componentCaptureServices))
        .registerCompositions(registrar =>
            registrar.registerComposition(compositionCaptureServices),
        )

    mount(
        <layout.CompositionsRenderer
            compositions={[
                { type: 'test', contentAreas: { main: [{ type: 'test', props: {} }] }, props: {} },
            ]}
            services={{ example: 'value' }}
        />,
    )

    expect(capturedComponentServices).toMatchObject({ example: 'value' })
    expect(capturedCompositionServices).toMatchObject({ example: 'value' })
})
