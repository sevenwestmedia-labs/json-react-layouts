import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'
import { LayoutRegistration } from '../LayoutRegistration'
import { ComponentInformation } from '../ComponentRegistrar'
import { NestedCompositionProps } from '../CompositionRegistrar'

it('can create a component instance', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    layout.component({
        type: 'test',
        props: {},
    })
})

it('can register nested compositions', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    layout.nestedComposition({
        type: 'test-composition',
        contentAreas: { main: [] },
        props: {},
    })
})

it('can create a content area instance', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    layout.contentArea(
        layout.component({
            type: 'test',
            props: {},
        }),
        layout.component({
            type: 'test2',
            props: {},
        }),
    )
})

it('can create a composition instance', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    layout.composition({
        type: 'test-composition',
        props: {},
        contentAreas: {
            main: layout.contentArea(
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
})

it('can create a page instance', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    layout.compositions(
        layout.composition({
            type: 'test-composition',
            props: {},
            contentAreas: {
                main: layout.contentArea(
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
})

type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never
