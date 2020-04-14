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

    component<Component extends Components & ComponentMiddlewaresProps>(
        component: Component,
    ): Extract<Components, { type: Component['type'] }>
    nestedComposition(composition: Compositions): ComponentInformation<any, any>
    components(...component: Array<Components & ComponentMiddlewaresProps>): Components[]
    composition<Composition extends Compositions & CompositionMiddlewaresProps>(
        composition: Composition,
    ): Extract<Compositions, { type: Composition['type'] }>
    compositions(...compositions: Array<Compositions & CompositionMiddlewaresProps>): Compositions[]

    // TODO Test out compositions not having the list of components in their types
    // and just using these helpers to put components in the content areas

    renderComponents(
        ...components: Array<Components & ComponentMiddlewaresProps>
    ): React.ReactElement
    renderCompositions(
        ...compositions: Array<Compositions & CompositionMiddlewaresProps>
    ): React.ReactElement
}
