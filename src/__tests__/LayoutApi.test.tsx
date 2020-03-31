import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'
import { LayoutRegistration } from '../LayoutRegistration'

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

    layout.component({
        type: 'test',
        props: {},
    })
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

    layout.component({
        type: 'nested-composition',
        contentAreas: { main: [] },
        props: {},
    })
})

it('can create a content area instance', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    layout.components(
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
    const layout = LayoutRegistration()
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
})

it('can create a page instance', () => {
    const layout = LayoutRegistration()
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
})
