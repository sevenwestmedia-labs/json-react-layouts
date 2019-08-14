import { testComponentRegistration, testCompositionRegistration } from '../__tests__/testComponents'
import { LayoutRegistration } from '../LayoutRegistration'

const layout = new LayoutRegistration()
    .registerComponents(registrar => registrar.registerComponent(testComponentRegistration))
    .registerCompositions(registrar => registrar.registerComposition(testCompositionRegistration))

// Should not compile
layout.component({
    type: 'missing',
    props: {},
})

// Should not compile
layout.contentArea({
    type: 'missing',
    props: {},
})

// Should not compile
layout.composition({ type: 'missing', props: {}, contentAreas: {} })
