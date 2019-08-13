import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, mount } from 'enzyme'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testCompositionRegistration,
    TestComposition,
    TestComponent,
} from './testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'

configure({ adapter: new Adapter() })

it('can render a composition with a content area', () => {
    const registrar = new ComponentRegistrar().register(testComponentRegistration)
    const compositionRegisrar = CompositionRegistrar.create(registrar).registerComposition(
        testCompositionRegistration,
    )
    const routeBuilder = new RouteBuilder(compositionRegisrar)

    const wrapper = mount(
        <compositionRegisrar.CompositionRenderer
            componentRenderPath="test"
            compositionInformation={{
                type: 'test-composition',
                props: {},
                contentAreas: {
                    main: [{ type: 'test', props: {} }],
                },
            }}
            routeBuilder={routeBuilder}
            loadDataServices={{}}
        />,
    )

    expect(wrapper.find(TestComposition)).toHaveLength(1)
    expect(wrapper.find(TestComponent)).toHaveLength(1)
})
