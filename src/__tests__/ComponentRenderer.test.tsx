import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponentWithPropsRegistration,
    TestComponent,
    testCompositionRegistration,
} from './testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { ComponentRenderer } from '../ComponentRenderer'

configure({ adapter: new Adapter() })

const registrar = new ComponentRegistrar()
    .register(testComponentRegistration)
    .register(testComponentWithPropsRegistration)
const compositionRegistrar = CompositionRegistrar.create(registrar).registerComposition(
    testCompositionRegistration,
)
const routeBuilder = new RouteBuilder(compositionRegistrar)

it('can render simple test component', () => {
    const wrapper = mount(
        <ComponentRenderer
            type="test"
            componentProps={{ componentRenderPath: '/' }}
            middlewareProps={{}}
            routeBuilder={routeBuilder}
            componentRegistrar={registrar}
            loadDataServices={{}}
        />,
    )
    expect(wrapper.find(TestComponent).length).toBe(1)
})

it('can render simple component with renderProps', () => {
    const testTitle = 'testTheTitleHere'
    const renderer = (
        <ComponentRenderer
            type="testWithTitleProp"
            componentProps={{ title: testTitle, componentRenderPath: '/' }}
            middlewareProps={{}}
            routeBuilder={routeBuilder}
            componentRegistrar={registrar}
            loadDataServices={{}}
        />
    )
    const wrapper = mount(renderer)
    expect(wrapper.text()).toContain(testTitle)
})
