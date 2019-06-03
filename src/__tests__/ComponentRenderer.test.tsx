import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponentWithPropsRegistration,
    TestComponent,
    testCompositionRegistration,
    testComponentWithDataRegistration,
    TestComponentWithData,
} from '../testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { ComponentRenderer } from '../ComponentRenderer'
import { consoleLogger } from 'typescript-log'
import { DataLoaderResources, DataProvider } from 'react-ssr-data-loader'

configure({ adapter: new Adapter() })
const logger = consoleLogger()

const registrar = new ComponentRegistrar(logger)
    .register(testComponentRegistration)
    .register(testComponentWithPropsRegistration)
const compositionRegistrar = CompositionRegistrar.create(registrar).registerComposition(
    testCompositionRegistration,
)
const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

it('can render simple test component', () => {
    const wrapper = mount(
        <ComponentRenderer
            type="test"
            componentProps={{ componentRenderPath: '/' }}
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
            routeBuilder={routeBuilder}
            componentRegistrar={registrar}
            loadDataServices={{}}
        />
    )
    const wrapper = mount(renderer)
    expect(wrapper.text()).toContain(testTitle)
})

it('can load data for component', async () => {
    const componentRegistrar = new ComponentRegistrar(logger).register(
        testComponentWithDataRegistration,
    )
    const compositionRegisrar = CompositionRegistrar.create(componentRegistrar).registerComposition(
        testCompositionRegistration,
    )
    const resources = new DataLoaderResources<{}>()
    const routeBuilder = new RouteBuilder(compositionRegisrar, resources)

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            <compositionRegisrar.ContentAreaRenderer
                componentRenderPath="test"
                contentArea={[
                    { type: 'test-with-data', props: { dataDefinition: { dataArg: 'Foo' } } },
                ]}
                routeBuilder={routeBuilder}
                loadDataServices={{}}
            />
        </DataProvider>,
    )

    expect(wrapper.find(TestComponentWithData).text()).toBe('Loading')
    await new Promise(resolve => setTimeout(resolve))
    await new Promise(resolve => setTimeout(resolve))

    const component = wrapper.update().find(TestComponentWithData)
    expect(component.text()).toBe('Length: 3')
    expect(component.props()).toMatchSnapshot()
})
