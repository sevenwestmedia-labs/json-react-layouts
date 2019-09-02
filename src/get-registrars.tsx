import { ComponentInformation, ComponentRegistrar } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { LayoutApi } from './LayoutApi'

export function getRegistrars<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, any, any>,
    Services,
    ComponentMiddlewaresProps extends object
>(
    layout: LayoutApi<Components, Compositions, Services, ComponentMiddlewaresProps>,
): {
    componentRegistrar: ComponentRegistrar<Services, Components, ComponentMiddlewaresProps>
    compositionRegistrar: CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        Compositions
    >
} {
    return {
        componentRegistrar: (layout as any).compositionRegistrar.componentRegistrar,
        compositionRegistrar: (layout as any).compositionRegistrar,
    }
}
