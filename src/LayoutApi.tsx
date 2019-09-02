import React from 'react'
import { ComponentInformation } from './ComponentRegistrar'
import {
    CompositionInformation,
    CompositionRegistrar,
    CompositionRendererProps,
    ContentAreaRendererProps,
} from './CompositionRegistrar'
import { createCompositionsRenderer, Props } from './CompositionsRenderer'
import { createCompositionRenderer } from './CompositionRenderer'
import { createContentAreaRenderer } from './ContentAreaRenderer'

export type CompositionRenderer<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    LoadDataServices,
    ComponentMiddlewaresProps extends object
> = React.FC<
    CompositionRendererProps<Components, Compositions, LoadDataServices, ComponentMiddlewaresProps>
>

/**
 * Renders and type helpers for completed registrations
 */
export class LayoutApi<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services,
    ComponentMiddlewaresProps extends object
> {
    _compositionType!: Compositions
    _componentType!: Components & ComponentMiddlewaresProps
    _contentAreaType!: Components[]

    CompositionsRenderer: React.FC<
        Props<Components, Compositions, Services>
    > = createCompositionsRenderer(this, this.compositionRegistrar.componentRegistrar.logger)

    CompositionRenderer: CompositionRenderer<
        Components,
        Compositions,
        Services,
        ComponentMiddlewaresProps
    > = createCompositionRenderer(
        this,
        this.compositionRegistrar,
        this.compositionRegistrar.componentRegistrar.logger,
    )

    ContentAreaRenderer: React.FC<
        ContentAreaRendererProps<Components, Compositions, Services>
    > = createContentAreaRenderer(
        this.compositionRegistrar,
        this.compositionRegistrar.componentRegistrar.logger,
    )

    // Expects a composition registrar to be passed in
    constructor(
        private compositionRegistrar: CompositionRegistrar<
            Components,
            Services,
            ComponentMiddlewaresProps,
            Compositions
        >,
    ) {}

    component(component: Components & ComponentMiddlewaresProps) {
        return component
    }

    /** Nested compositions are special components
     * You need to use this function to create them then pass them as a component
     */
    nestedComposition(composition: Compositions): ComponentInformation<any, any> {
        return {
            type: 'nested-composition',
            props: { composition },
        }
    }

    contentArea(
        ...components: Array<Components & ComponentMiddlewaresProps>
    ): Array<ComponentInformation<any>> {
        return components
    }

    composition(composition: Compositions) {
        return composition
    }

    compositions(...compositions: Compositions[]): Compositions[] {
        return compositions
    }
}
