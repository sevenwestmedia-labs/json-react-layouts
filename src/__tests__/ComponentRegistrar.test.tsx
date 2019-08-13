import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, mount } from 'enzyme'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    TestComponentWithProps,
    testComponentWithPropsRegistration,
} from './testComponents'

configure({ adapter: new Adapter() })

it('can get a registered component', () => {
    const registrar = new ComponentRegistrar().register(testComponentRegistration)

    const registration = registrar.get('test')

    expect(registration).toBeDefined()
})

it('can create a ComponentsRenderer', () => {
    const registrar = new ComponentRegistrar<{}>().register(testComponentWithPropsRegistration)

    const ComponentsRenderer = registrar.createRenderer()
    const title = 'Test title'

    const wrapper = mount(
        <ComponentsRenderer
            components={[{ type: 'testWithTitleProp', props: { title } }]}
            loadDataServices={{}}
        />,
    )

    expect(wrapper.find(TestComponentWithProps).length).toBe(1)
    expect(wrapper.text()).toContain(title)
})
