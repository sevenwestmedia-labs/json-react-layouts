import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Logger } from 'typescript-log'
import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'

configure({ adapter: new Adapter() })

it('can render a composition with a content area through the registrar', () => {
    const logMessages: any[] = []
    const addToLog = (...args: any[]) =>
        logMessages.push(
            args.reduce<string>(
                (acc, val) => (acc ? acc + ', ' + JSON.stringify(val) : JSON.stringify(val)),
                '',
            ),
        )
    const logger: Logger = {
        child: () => logger,
        debug: addToLog,
        error: addToLog,
        fatal: addToLog,
        info: addToLog,
        trace: addToLog,
        warn: addToLog,
    }

    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar)

    mount(
        <routeBuilder.PageRenderer
            loadDataServices={{}}
            compositions={[
                {
                    type: 'test-composition',
                    props: {},
                    contentAreas: {
                        main: [
                            { type: 'test', props: {} },
                            routeBuilder.nestedComposition({
                                type: 'test-composition',
                                props: {},
                                contentAreas: { main: [{ type: 'test', props: {} }] },
                            }),
                        ],
                    },
                },
            ]}
        />,
    )

    expect(logMessages).toMatchSnapshot()
})
