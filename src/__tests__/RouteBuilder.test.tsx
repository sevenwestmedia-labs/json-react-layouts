import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'
import { RouteBuilder } from '../RouteBuilder'
import { CompositionRegistrar } from '../CompositionRegistrar'

it('can create a component instance', () => {
    const componentRegistrar = new ComponentRegistrar()
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)

    const routeBuilder = new RouteBuilder(compositionRegistrar)

    routeBuilder.component({
        type: 'test',
        props: {},
    })
})

it('can register nested compositions', () => {
    const componentRegistrar = new ComponentRegistrar()
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar)

    routeBuilder.nestedComposition({
        type: 'test-composition',
        contentAreas: { main: [] },
        props: {},
    })
})

it('can create a content area instance', () => {
    const componentRegistrar = new ComponentRegistrar()
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar)

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
    const componentRegistrar = new ComponentRegistrar()
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar)

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
    const componentRegistrar = new ComponentRegistrar()
        .register(testComponentRegistration)
        .register(testComponent2Registration)
    const compositionRegistrar = CompositionRegistrar.create(
        componentRegistrar,
    ).registerComposition(testCompositionRegistration)
    const routeBuilder = new RouteBuilder(compositionRegistrar)

    routeBuilder.compositions(
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
