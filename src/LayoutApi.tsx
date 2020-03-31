import { ComponentInformation, CompositionInformation } from '.'

export interface LayoutApi<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    ComponentMiddlewaresProps extends object,
    CompositionMiddlewaresProps extends object
> {
    /**
     * @example
     * const Composition: typeof layout._compositionType = {...}
     */
    _compositionType: Compositions & CompositionMiddlewaresProps

    /**
     * @example
     * const Component: typeof layout._componentType = {...}
     */
    _componentType: Components & ComponentMiddlewaresProps

    component(component: Components & ComponentMiddlewaresProps): Components
    components(...component: Array<Components & ComponentMiddlewaresProps>): Components[]
    composition(composition: Compositions & CompositionMiddlewaresProps): Compositions
    compositions(...compositions: Array<Compositions & CompositionMiddlewaresProps>): Compositions[]
}
