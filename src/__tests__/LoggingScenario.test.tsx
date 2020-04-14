import React from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Logger } from 'typescript-log'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'
import { LayoutRegistration } from '../LayoutRegistration'

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
    const log: Logger = {
        child: () => log,
        debug: addToLog,
        error: addToLog,
        fatal: addToLog,
        info: addToLog,
        trace: addToLog,
        warn: addToLog,
    }

    const layout = LayoutRegistration(log)
        .registerComponents((registrar) =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions((registrar) =>
            registrar.registerComposition(testCompositionRegistration),
        )
        .withServices({})

    mount(
        layout.renderCompositions({
            type: 'test-composition',
            props: {},
            contentAreas: {
                main: [
                    { type: 'test', props: {} },
                    layout.nestedComposition({
                        type: 'test-composition',
                        props: {},
                        contentAreas: { main: [{ type: 'test', props: {} }] },
                    }),
                ],
            },
        }),
    )

    expect(logMessages).toMatchSnapshot()
})
