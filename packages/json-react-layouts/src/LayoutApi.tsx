import { ComponentInformation, CompositionInformation } from '.'
import { Logger } from 'typescript-log'
import { ComponentRegistrations } from './ComponentRegistrar'
import { CompositionRegistrations } from './CompositionRegistrar'
import { ComponentCheckedMessage, CompositionCheckedMessage } from './LayoutRegistration'

export type CheckedComponentInformation = ComponentInformation<any, any> & ComponentCheckedMessage

export type CheckedCompositionInformation = CompositionInformation<any, any, any> &
    CompositionCheckedMessage

export interface LayoutApi<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, any, any>,
    ComponentMiddlewaresProps extends {},
    CompositionMiddlewaresProps extends {},
    Services extends {}
> {
    component<Component extends Components>(
        component: Component & ComponentMiddlewaresProps,
    ): CheckedComponentInformation

    nestedComposition<Composition extends Compositions & CompositionMiddlewaresProps>(
        composition: Composition,
    ): CheckedComponentInformation

    composition<Composition extends Compositions & CompositionMiddlewaresProps>(
        composition: Composition,
    ): CheckedCompositionInformation

    componentRegistrations: ComponentRegistrations
    compositionRegistrations: CompositionRegistrations

    createRenderers(options: { services: Services; log?: Logger }): RenderLayouts
    // TODO Test out compositions not having the list of components in their types
    // and just using these helpers to put components in the content areas
}

export interface RenderLayouts {
    renderComponents(...components: CheckedComponentInformation[]): React.ReactElement
    renderCompositions(...compositions: CheckedCompositionInformation[]): React.ReactElement
}
