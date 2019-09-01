import { ComponentInformation, ComponentRegistrar } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { LayoutApi } from './LayoutApi'

export function getRegistrars<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, any, any>,
    Services,
    ComponentMiddlewares extends object
>(
    layout: LayoutApi<Components, Compositions, Services, ComponentMiddlewares>,
): {
    componentRegistrar: ComponentRegistrar<Services, Components, ComponentMiddlewares>
    compositionRegistrar: CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewares,
        Compositions
    >
} {
    return {
        componentRegistrar: (layout as any).compositionRegistrar.componentRegistrar,
        compositionRegistrar: (layout as any).compositionRegistrar,
    }
}
