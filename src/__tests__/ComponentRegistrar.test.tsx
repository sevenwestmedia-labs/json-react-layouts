import { ComponentRegistrar, ComponentInformation } from '../ComponentRegistrar'
import { testComponentRegistration } from './testComponents'

it('can get a registered component', () => {
    // need the cast in tests to make the public API nicer
    const registrar = new ComponentRegistrar().registerComponent(
        testComponentRegistration,
    ) as ComponentRegistrar<{}, ComponentInformation<'test', {}>, {}>

    const registration = registrar.get('test')

    expect(registration).toBeDefined()
})
