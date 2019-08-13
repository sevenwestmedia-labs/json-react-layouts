import { CompositionRenderFunction, CompositionRegistration } from './CompositionRegistrar'
import { ComponentRegistration, RenderFunction } from './ComponentRegistrar'

// TODO This probably needs a better name

/**
 * @example const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<MyServices>()
 */
export function getRegistrationCreators<TLoadDataServices>() {
    return {
        /** Helper function to create the registration (to infer types) */
        createRegisterableComponent<TType extends string, TProps extends {}>(
            type: TType,
            render: RenderFunction<TProps, TLoadDataServices>,
        ): ComponentRegistration<TType, TProps, TLoadDataServices> {
            return { type, render }
        },

        /** Creates a registerable composition, it is a two step process due to TypeScript limitations
         *
         * First createRegisterableComponent<'main'|'sidebar'>() creates a registration function
         * for a composition with two content areas, main and sidebar.
         * Second call that registration function to create the registration.
         */
        createRegisterableComposition<TContentAreas extends string, TProps extends {}>() {
            return <TType extends string>(
                type: TType,
                render: CompositionRenderFunction<TContentAreas, TProps>,
            ): CompositionRegistration<TType, TContentAreas, TProps> => ({ type, render })
        },
    }
}
