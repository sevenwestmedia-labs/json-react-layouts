import React from 'react'
import { configure, mount } from 'enzyme'
import { DataProvider, DataLoaderResources } from 'react-ssr-data-loader'
import Adapter from 'enzyme-adapter-react-16'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
    TestComponent,
    TestComponent2,
    TestComposition,
} from '../testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { consoleLogger } from 'typescript-log'

configure({ adapter: new Adapter() })
const logger = consoleLogger()

it('can render a composition with a content area through the registrar', () => {
    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)

    const resources = new DataLoaderResources<{}>()
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar, resources)
    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            <routeBuilder.PageRenderer
                loadDataServices={{}}
                compositions={[
                    {
                        type: 'test-composition',
                        props: {},
                        contentAreas: { main: [{ type: 'test', props: {} }] },
                    },
                    {
                        type: 'test-composition',
                        props: {},
                        contentAreas: {
                            main: [{ type: 'test', props: {} }, { type: 'test2', props: {} }],
                        },
                    },
                    {
                        type: 'test-composition',
                        props: {},
                        contentAreas: { main: [{ type: 'test2', props: {} }] },
                    },
                ]}
            />
        </DataProvider>,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(2)
    expect(wrapper.find(TestComponent2)).toHaveLength(2)
    expect(wrapper.find(TestComposition)).toHaveLength(3)
})

it('can render a nested composition', () => {
    const resources = new DataLoaderResources<{}>()
    const componentRegistrar = new ComponentRegistrar(logger).register(testComponentRegistration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar, resources)
    const wrapper = mount(
        <DataProvider resources={resources} globalProps={{}}>
            <routeBuilder.PageRenderer
                loadDataServices={{}}
                compositions={[
                    {
                        type: 'test-composition',
                        props: {},
                        contentAreas: {
                            main: [
                                // This is how you make a nested composition work
                                routeBuilder.nestedComposition({
                                    type: 'test-composition',
                                    props: {},
                                    contentAreas: { main: [{ type: 'test', props: {} }] },
                                }),
                            ],
                        },
                    },
                ]}
            />
        </DataProvider>,
    )

    expect(wrapper.find(TestComponent)).toHaveLength(1)
})
