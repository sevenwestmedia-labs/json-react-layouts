import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { configure, mount } from 'enzyme'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponentWithPropsRegistration,
    TestComponentWithProps,
    testCompositionRegistration,
} from '../testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { consoleLogger } from 'typescript-log'
import { DataLoaderResources } from 'react-ssr-data-loader/dist'

configure({ adapter: new Adapter() })
const testLogger = consoleLogger()

it('can get a registered component', () => {
    const registrar = new ComponentRegistrar(testLogger).register(testComponentRegistration)

    const registration = registrar.get('test')

    expect(registration).toBeDefined()
})

it('can get a component to render with props', () => {
    const registrar = new ComponentRegistrar(testLogger).register(
        testComponentWithPropsRegistration,
    )

    const compositionRegistrar = CompositionRegistrar.create(registrar).registerComposition(
        testCompositionRegistration,
    )
    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources(), {
        loadComponent: () => Promise.resolve({}),
    })
    const title = 'testTitle'

    const registeredComponent = registrar.get('testWithTitleProp').render

    const wrapper = mount(
        registeredComponent(
            { title },
            {
                routeBuilder,
                loadDataServices: {},
            },
        ) || <noscript />,
    )

    expect(wrapper.find(TestComponentWithProps).length).toBe(1)
    expect(wrapper.text()).toContain(title)
})
