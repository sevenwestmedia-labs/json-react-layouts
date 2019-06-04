import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'
import { RouteBuilder } from '../RouteBuilder'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { consoleLogger } from 'typescript-log'
import { DataLoaderResources } from 'react-ssr-data-loader/dist'

const logger = consoleLogger()

it('can create a component instance', () => {
    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

    routeBuilder.component({
        type: 'test',
        props: {},
    })
})

it('can register nested compositions', () => {
    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

    routeBuilder.nestedComposition({
        type: 'test-composition',
        contentAreas: { main: [] },
        props: {},
    })
})

it('can create a content area instance', () => {
    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

    routeBuilder.contentArea(
        routeBuilder.component({
            type: 'test',
            props: {},
        }),
        routeBuilder.component({
            type: 'test2',
            props: {},
        }),
    )
})

it('can create a composition instance', () => {
    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

    routeBuilder.composition({
        type: 'test-composition',
        props: {},
        contentAreas: {
            main: routeBuilder.contentArea(
                routeBuilder.component({
                    type: 'test',
                    props: {},
                }),
                routeBuilder.component({
                    type: 'test2',
                    props: {},
                }),
            ),
        },
    })
})

it('can create a page instance', () => {
    const componentRegistrar = new ComponentRegistrar(logger)
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar, new DataLoaderResources())

    routeBuilder.page(
        routeBuilder.composition({
            type: 'test-composition',
            props: {},
            contentAreas: {
                main: routeBuilder.contentArea(
                    routeBuilder.component({
                        type: 'test',
                        props: {},
                    }),
                    routeBuilder.component({
                        type: 'test2',
                        props: {},
                    }),
                ),
            },
        }),
    )
})
