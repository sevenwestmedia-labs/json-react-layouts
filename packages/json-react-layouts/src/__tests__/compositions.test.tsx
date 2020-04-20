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
    (contentAreas, _: { widthRatio: number }) => (
        <TestComposition main={contentAreas.main} sidebar={contentAreas.sidebar} />
    ),
    ({ contentArea, props }) => {
        if (contentArea === 'main') {
            return { contentAreaRatio: 0.66 * props.widthRatio }
        }

        return { contentAreaRatio: 0.32 * props.widthRatio }
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
                props: { widthRatio: 0.5 },
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

    expect(wrapper.find(TestComponent).props()).toMatchObject({ contentAreaRatio: 0.33 })
    expect(wrapper.find(TestComponent2).props()).toMatchObject({ contentAreaRatio: 0.16 })
})
