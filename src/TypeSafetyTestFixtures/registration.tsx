import { ComponentRegistrar } from '../ComponentRegistrar'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from '../__tests__/testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'

const registrar = new ComponentRegistrar().register(testComponentRegistration)

// Cannot get un-registered type - example
registrar.get('test2')

// Chained
const registrar2 = registrar.register(testComponent2Registration)

registrar2.get('test2')

// Ensure that content areas remains typed
// @ts-ignore
const compositionRegistrar = CompositionRegistrar.registerComponents(registrar).registerComposition(
    testCompositionRegistration,
)
