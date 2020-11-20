import React from 'react'
import { getRegistrationCreators, LayoutRegistration } from '..'
import {
    testComponentRegistration,
    testComponent2Registration,
    TestComponent,
    TestComponent2,
} from './testComponents'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

const { createRegisterableComposition } = getRegistrationCreators<{}>()

configure({ adapter: new Adapter() })

export const TestComposition: React.FC<{
    main: React.ReactElement<any>
    sidebar: React.ReactElement<any>
}> = props => (
    <div>
        <div>{props.main}</div>
        <div>{props.sidebar}</div>
    </div>
)

export const testCompositionRegistration = createRegisterableComposition<'main' | 'sidebar'>()(
    'test-composition',
    contentAreas => <TestComposition main={contentAreas.main} sidebar={contentAreas.sidebar} />,
    (contentArea, { contentAreaRatio = 1 }: { contentAreaRatio?: number }) => {
        if (contentArea === 'main') {
            return { contentAreaRatio: 0.66 * contentAreaRatio }
        }

        return { contentAreaRatio: 0.32 * contentAreaRatio }
    },
)

it('can pass props to all contained components', () => {
    const layout = LayoutRegistration<{}>()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const renderers = layout.createRenderers({ services: {} })

    const wrapper = mount(
        renderers.renderCompositions(
            layout.composition({
                type: 'test-composition',
                props: {},
                contentAreas: {
                    main: [
                        layout.component({
                            type: 'test',
                            props: {},
                        }),
                    ],
                    sidebar: [
                        layout.component({
                            type: 'test2',
                            props: {},
                        }),
                    ],
                },
            }),
        ),
    )

    expect(wrapper.find(TestComponent).props()).toMatchObject({ contentAreaRatio: 0.66 })
    expect(wrapper.find(TestComponent2).props()).toMatchObject({ contentAreaRatio: 0.32 })
})

it('nested compositions pass additional props to composition', () => {
    const layout = LayoutRegistration<{}>()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const renderers = layout.createRenderers({ services: {} })

    const wrapper = mount(
        renderers.renderCompositions(
            layout.composition({
                type: 'test-composition',
                props: {},
                contentAreas: {
                    main: [
                        layout.nestedComposition({
                            type: 'test-composition',
                            props: {},
                            contentAreas: {
                                main: [
                                    layout.component({
                                        type: 'test',
                                        props: {},
                                    }),
                                ],
                                sidebar: [],
                            },
                        }),
                    ],
                    sidebar: [
                        layout.component({
                            type: 'test2',
                            props: {},
                        }),
                    ],
                },
            }),
        ),
    )

    expect(wrapper.find(TestComponent).props()).toMatchObject({ contentAreaRatio: 0.66 * 0.66 })
    expect(wrapper.find(TestComponent2).props()).toMatchObject({ contentAreaRatio: 0.32 })
})
