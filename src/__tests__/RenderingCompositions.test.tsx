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
} from './testComponents'
import { LayoutRegistration } from '../LayoutRegistration'

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
