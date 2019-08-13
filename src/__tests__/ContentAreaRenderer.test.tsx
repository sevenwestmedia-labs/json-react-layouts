import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, mount } from 'enzyme'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testCompositionRegistration,
    TestComponent,
} from './testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'

configure({ adapter: new Adapter() })

it('can render a content area with a registered single component', () => {
    const componentRegistrar = new ComponentRegistrar().register(testComponentRegistration)
    const compositionRegisrar = CompositionRegistrar.create(componentRegistrar).registerComposition(
        testCompositionRegistration,
    )
    const routeBuilder = new RouteBuilder(compositionRegisrar)

    const wrapper = mount(
        <compositionRegisrar.ContentAreaRenderer
            componentRenderPath="test"
            contentArea={[{ type: 'test', props: {} }]}
            routeBuilder={routeBuilder}
            loadDataServices={{}}
        />,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(1)
})
