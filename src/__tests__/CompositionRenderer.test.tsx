import React from 'react'
import { DataProvider, DataLoaderResources } from 'react-ssr-data-loader'
import Adapter from 'enzyme-adapter-react-16'
import { configure, mount } from 'enzyme'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testCompositionRegistration,
    TestComposition,
    TestComponent,
} from '../testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { consoleLogger } from 'typescript-log'

configure({ adapter: new Adapter() })
const logger = consoleLogger()

it('can render a composition with a content area', () => {
    const registrar = new ComponentRegistrar(logger).register(testComponentRegistration)
    const compositionRegisrar = CompositionRegistrar.create(registrar).registerComposition(
        testCompositionRegistration,
    )
    const resources = new DataLoaderResources<{}>()
    const routeBuilder = new RouteBuilder(compositionRegisrar, resources)

    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
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
            />
        </DataProvider>,
    )

    expect(wrapper.find(TestComposition)).toHaveLength(1)
    expect(wrapper.find(TestComponent)).toHaveLength(1)
})
