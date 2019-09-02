import React from 'react'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { LayoutRegistration } from '../LayoutRegistration'
import { testComponentWithPropsRegistration, TestComponentWithProps } from './testComponents'
import { getRegistrationCreators } from '../get-registration-creators'

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

it('gets services', () => {
    interface ExampleServices {
        example: string
    }
    const { createRegisterableComponent } = getRegistrationCreators<ExampleServices>()

    let capturedServices: ExampleServices | undefined = undefined

    const componentCaptureServices = createRegisterableComponent('test', (_, services) => {
        capturedServices = services
        return null
    })

    const ComponentsRenderer = new LayoutRegistration<ExampleServices>()
        .registerComponents(registrar => registrar.registerComponent(componentCaptureServices))
        .createComponentsRenderer()

    mount(
        <ComponentsRenderer
            components={[{ type: 'test', props: {} }]}
            services={{ example: 'value' }}
        />,
    )

    expect(capturedServices).toMatchObject({ example: 'value' })
})
