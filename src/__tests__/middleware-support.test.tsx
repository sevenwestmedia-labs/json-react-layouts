import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentWithPropsRegistration,
    testCompositionRegistration,
    TestComponentWithProps,
} from './testComponents'
import { consoleLogger } from 'typescript-log'
import { configure, mount } from 'enzyme'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { DataLoaderResources } from 'react-ssr-data-loader'

configure({ adapter: new Adapter() })
const logger = consoleLogger()

it('can hook component middleware', () => {
    let middlewareCalled: any
    let middlewareProps: any
    let middlewareNext: any
    const registrar = new ComponentRegistrar(logger)
        .register(testComponentWithPropsRegistration)
        .registerMiddleware((props: { skipRender?: boolean }, _, next) => {
            middlewareCalled = true
            middlewareProps = props
            middlewareNext = next

            return null
        })

    const compositionRegistrar = CompositionRegistrar.create(registrar).registerComposition(
        testCompositionRegistration,
    )

    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

    mount(
        <compositionRegistrar.ContentAreaRenderer
            componentRenderPath="test"
            contentArea={[
                { type: 'testWithTitleProp', props: { title: 'test' }, skipRender: true },
            ]}
            routeBuilder={routeBuilder}
            loadDataServices={{}}
        />,
    )

    expect(middlewareCalled).toBe(true)
    expect(middlewareProps).toMatchObject({ skipRender: true })

    // Verify next() will actually render the component
    const renderOutput = mount(middlewareNext())

    expect(renderOutput.find(TestComponentWithProps).length).toBe(1)
    expect(renderOutput.text()).toContain('test')
})
