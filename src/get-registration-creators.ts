import { CompositionRenderFunction, CompositionRegistration } from './CompositionRegistrar'
import { ComponentRegistration, RenderFunction } from './ComponentRegistrar'

/**
 * @example const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<MyServices>()
 */
export function getRegistrationCreators<Services>() {
    return {
        /** Helper function to create the registration (to infer types) */
        createRegisterableComponent<ComponentType extends string, ComponentProps extends {}>(
            type: ComponentType,
            render: RenderFunction<ComponentProps, Services>,
        ): ComponentRegistration<ComponentType, ComponentProps, Services> {
            return { type, render }
        },

        /** Creates a registerable composition, it is a two step process due to TypeScript limitations
         *
         * First createRegisterableComponent<'main'|'sidebar'>() creates a registration function
         * for a composition with two content areas, main and sidebar.
         * Second call that registration function to create the registration.
         */
        createRegisterableComposition<ContentAreas extends string>() {
            return <CompositionType extends string, CompositionProps extends object = {}>(
                type: CompositionType,
                render: CompositionRenderFunction<ContentAreas, CompositionProps, Services>,
            ): CompositionRegistration<
                CompositionType,
                ContentAreas,
                Services,
                CompositionProps
            > => ({
                type,
                render,
            })
        },
    }
}
