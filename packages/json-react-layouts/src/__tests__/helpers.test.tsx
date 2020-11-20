import { LayoutRegistration, getComponentsInCompositions } from '..'

import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'

it('calculates correct render path', () => {
    const layout = LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const compositions = [
        layout.composition({
            type: 'test-composition',
            props: {},
            contentAreas: {
                main: [
                    layout.component({ type: 'test', props: {} }),
                    layout.nestedComposition({
                        type: 'test-composition',
                        props: {},
                        contentAreas: {
                            main: [
                                layout.component({ type: 'test', props: {} }),
                                layout.component({ type: 'test', props: {} }),
                            ],
                        },
                    }),
                    layout.component({ type: 'test', props: {} }),
                ],
            },
        }),
    ]

    const components = getComponentsInCompositions(compositions, undefined)

    expect(components).toEqual([
        {
            props: {},
            type: 'test',
            componentRenderPath: '[0]test-composition/main/[0]',
        },
        {
            props: {},
            type: 'test',
            componentRenderPath: '[0]test-composition/main/[1]nested:test-composition/main/[0]',
        },
        {
            props: {},
            type: 'test',
            componentRenderPath: '[0]test-composition/main/[1]nested:test-composition/main/[1]',
        },
        {
            props: {},
            type: 'test',
            componentRenderPath: '[0]test-composition/main/[2]',
        },
    ])
})
