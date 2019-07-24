import React from 'react'
import { ComponentRegistrar } from '../ComponentRegistrar'
import { testComponentRegistration, testCompositionRegistration } from '../__tests__/testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'
import { consoleLogger } from 'typescript-log'
import { DataLoaderResources } from 'react-ssr-data-loader/dist'

const logger = consoleLogger()
const registrar = new ComponentRegistrar(logger).register(testComponentRegistration)
const compositionRegistrar = CompositionRegistrar.create(registrar).registerComposition(
    testCompositionRegistration,
)

const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources<{}>())

// Should not compile
// @ts-ignore
const _el = (
    <routeBuilder.PageRenderer
        log={logger}
        loadDataServices={{}}
        compositions={[
            {
                type: 'test-composition2',
                props: {},
                contentAreas: { main: [] },
            },
        ]}
    />
)

// Should not compile
// @ts-ignore
const _el2 = (
    <routeBuilder.PageRenderer
        log={logger}
        compositions={[
            {
                type: 'test-composition',
                props: {},
                contentAreas: { main: [{ type: 'test2', props: {} }] },
            },
        ]}
    />
)
