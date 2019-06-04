import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { DataProvider, DataLoaderResources } from 'react-ssr-data-loader'
import { configure, mount } from 'enzyme'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testCompositionRegistration,
    TestComponent,
} from './testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { consoleLogger } from 'typescript-log'

configure({ adapter: new Adapter() })
const logger = consoleLogger()

it('can render a content area with a registered single component', () => {
    const componentRegistrar = new ComponentRegistrar(logger).register(testComponentRegistration)
    const compositionRegisrar = CompositionRegistrar.create(componentRegistrar).registerComposition(
        testCompositionRegistration,
    )
    const resources = new DataLoaderResources<{}>()
    const routeBuilder = new RouteBuilder(compositionRegisrar, resources)

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            <compositionRegisrar.ContentAreaRenderer
                componentRenderPath="test"
                contentArea={[{ type: 'test', props: {} }]}
                routeBuilder={routeBuilder}
                loadDataServices={{}}
            />
        </DataProvider>,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(1)
})
