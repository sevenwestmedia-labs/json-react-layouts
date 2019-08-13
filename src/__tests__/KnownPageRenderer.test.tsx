import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
    TestComponent,
    TestComponent2,
    TestComposition,
} from './testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'

configure({ adapter: new Adapter() })

it('can render a composition with a content area through the registrar', () => {
    const componentRegistrar = new ComponentRegistrar()
        .register(testComponentRegistration)
        .register(testComponent2Registration)

    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar)
    const wrapper = mount(
        <routeBuilder.CompositionsRenderer
            loadDataServices={{}}
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
    const componentRegistrar = new ComponentRegistrar().register(testComponentRegistration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar)
    const wrapper = mount(
        <routeBuilder.CompositionsRenderer
            loadDataServices={{}}
            compositions={[
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: {
                        main: [
                            // This is how you make a nested composition work
                            routeBuilder.nestedComposition({
                                type: 'test-composition',
                                props: {},
                                contentAreas: { main: [{ type: 'test', props: {} }] },
                            }),
                        ],
                    },
                },
            ]}
        />,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(1)
})
