import { ComponentRegistrar } from '../ComponentRegistrar'
import { testComponentRegistration, testCompositionRegistration } from '../__tests__/testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { RouteBuilder } from '../RouteBuilder'

const registrar = new ComponentRegistrar().register(testComponentRegistration)
const compositionRegistrar = CompositionRegistrar.create(registrar).registerComposition(
    testCompositionRegistration,
)

const routeBuilder = new RouteBuilder(compositionRegistrar)

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
