import React from 'react'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { LayoutRegistration } from '../LayoutRegistration'
import { testComponentWithPropsRegistration, TestComponentWithProps } from './testComponents'

configure({ adapter: new Adapter() })

it('can create a ComponentsRenderer', () => {
    const ComponentsRenderer = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar.registerComponent(testComponentWithPropsRegistration),
        )
        .createComponentsRenderer()

    const title = 'Test title'

    const wrapper = mount(
        <ComponentsRenderer
            components={[{ type: 'testWithTitleProp', props: { title } }]}
            services={{}}
        />,
    )

    expect(wrapper.find(TestComponentWithProps).length).toBe(1)
    expect(wrapper.text()).toContain(title)
})
