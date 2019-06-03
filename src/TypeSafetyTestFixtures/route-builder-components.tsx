import { ComponentRegistrar } from '../ComponentRegistrar'
import { testComponentRegistration, testCompositionRegistration } from '../testComponents'
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
routeBuilder.component({
    type: 'missing',
    props: {},
})

// Should not compile
routeBuilder.contentArea({
    type: 'missing',
    props: {},
})

// Should not compile
routeBuilder.composition({ type: 'missing', props: {}, contentAreas: {} })
