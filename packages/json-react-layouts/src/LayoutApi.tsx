import { ComponentInformation, CompositionInformation } from '.'
import { Logger } from 'typescript-log'
import { ComponentRegistrations } from './ComponentRegistrar'
import { CompositionRegistrations } from './CompositionRegistrar'
import { ComponentCheckedMessage, CompositionCheckedMessage } from './LayoutRegistration'

export interface LayoutApi<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, any, any>,
    ComponentMiddlewaresProps extends {},
    CompositionMiddlewaresProps extends {},
    Services extends {}
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
    ): Extract<Components, { type: Component['type'] }> & ComponentCheckedMessage

    nestedComposition<Composition extends Compositions & CompositionMiddlewaresProps>(
        composition: Composition,
    ): ComponentInformation<any, any> & ComponentCheckedMessage

    composition<Composition extends Compositions & CompositionMiddlewaresProps>(
        composition: Composition,
    ): Extract<Compositions, { type: Composition['type'] }> & CompositionCheckedMessage

    componentRegistrations: ComponentRegistrations
    compositionRegistrations: CompositionRegistrations

    createRenderers(options: { services: Services; log?: Logger }): RenderLayouts
    // TODO Test out compositions not having the list of components in their types
    // and just using these helpers to put components in the content areas
}

export interface RenderLayouts {
    renderComponents(
        ...components: Array<ComponentInformation<any, any> & ComponentCheckedMessage>
    ): React.ReactElement
    renderCompositions(
        ...compositions: Array<CompositionInformation<any, any, any> & CompositionCheckedMessage>
    ): React.ReactElement
}
