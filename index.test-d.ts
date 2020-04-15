import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
    testComponent3Registration,
    testCompositionWithPropsRegistration,
    testComponentWithPropsRegistration,
} from './packages/json-react-layouts/src/__tests__/testComponents'
import {
    CompositionInformation,
    ComponentInformation,
    LayoutRegistration,
} from './packages/json-react-layouts/src'
import { expectType, expectError } from 'tsd'

it('can create a component instance', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const component = layout.component({
        type: 'test',
        props: {},
    })

    expectType<ComponentInformation<'test', {}>>(component)
})

it('can register nested compositions', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const nestedComposition = layout.nestedComposition({
        type: 'test-composition',
        contentAreas: { main: [] },
        props: {},
    })

    expectType<ComponentInformation<any, any>>(nestedComposition)
})

it('can create a content area instance', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration)
                .registerComponent(testComponent3Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const components = layout.components(
        layout.component({
            type: 'test',
            props: {},
        }),
        layout.component({
            type: 'test2',
            props: {},
        }),
    )

    expectType<
        Array<
            | ComponentInformation<'test', {}>
            | ComponentInformation<'test2', {}>
            | ComponentInformation<'test3', {}>
        >
    >(components)
})

it('can create a composition instance', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const composition = layout.composition({
        type: 'test-composition',
        props: {},
        contentAreas: {
            main: layout.components(
                layout.component({
                    type: 'test',
                    props: {},
                }),
                layout.component({
                    type: 'test2',
                    props: {},
                }),
            ),
        },
    })

    expectType<
        CompositionInformation<
            'test-composition',
            ComponentInformation<'test', {}> | ComponentInformation<'test2', {}>,
            'main',
            {}
        >
    >(composition)
})

it('can create a page instance', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionRegistration)
                .registerComposition(testCompositionWithPropsRegistration),
        )

    const compositions = layout.compositions(
        layout.composition({
            type: 'test-composition',
            props: {},
            contentAreas: {
                main: layout.components(
                    layout.component({
                        type: 'test',
                        props: {},
                    }),
                    layout.component({
                        type: 'test2',
                        props: {},
                    }),
                ),
            },
        }),
    )

    expectType<
        Array<
            | CompositionInformation<
                  'test-composition',
                  ComponentInformation<'test', {}> | ComponentInformation<'test2', {}>,
                  'main',
                  {}
              >
            | CompositionInformation<
                  'test-composition-with-props',
                  ComponentInformation<'test', {}> | ComponentInformation<'test2', {}>,
                  'main',
                  {}
              >
        >
    >(compositions)
})

it('prevents using incorrect component', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    expectError(
        layout.component({
            type: 'does-not-exist',
            props: {},
        }),
    )
})

it('prevents using incorrect component props', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration)
                .registerComponent(testComponentWithPropsRegistration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    expectError(
        layout.component({
            type: 'testWithTitleProp',
            props: {},
        }),
    )
    expectError(
        layout.component({
            type: 'testWithTitleProp',
            props: { title: 1 },
        }),
    )
})

it('prevents using incorrect composition', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar
                .registerComposition(testCompositionRegistration)
                .registerComposition(testCompositionWithPropsRegistration),
        )

    expectError(
        layout.composition({
            type: 'does-not-exist',
            props: {},
        }),
    )
    expectError(
        layout.composition({
            type: 'test-composition-with-props',
            props: { compositionTitle: 1 },
        }),
    )
})
