import { getRegistrars } from '../get-registrars'
import { LayoutRegistration } from '../LayoutRegistration'
import {
    testComponentRegistration,
    testComponent2Registration,
    testCompositionRegistration,
} from './testComponents'

it('can get registrars', () => {
    const layout = new LayoutRegistration()
        .registerComponents(registrar =>
            registrar
                .registerComponent(testComponentRegistration)
                .registerComponent(testComponent2Registration),
        )
        .registerCompositions(registrar =>
            registrar.registerComposition(testCompositionRegistration),
        )

    const { componentRegistrar, compositionRegistrar } = getRegistrars(layout)

    expect(componentRegistrar).toBeDefined()
    expect(compositionRegistrar).toBeDefined()
})
