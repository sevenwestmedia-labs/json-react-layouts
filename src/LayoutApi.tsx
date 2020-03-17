import React from 'react'
import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { createCompositionsRenderer, Props } from './CompositionsRenderer'
import { createCompositionRenderer, CompositionRendererProps } from './CompositionRenderer'
import { createContentAreaRenderer, ContentAreaRendererProps } from './ContentAreaRenderer'

/**
 * Renders and type helpers for completed registrations
 */
export class LayoutApi<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services,
    ComponentMiddlewaresProps extends object,
    CompositionMiddlewaresProps extends object
> {
    _compositionType!: Compositions & CompositionMiddlewaresProps
    _componentType!: Components & ComponentMiddlewaresProps
    _contentAreaType!: Components[]

    // Expects a composition registrar to be passed in
    constructor(
        private compositionRegistrar: CompositionRegistrar<
            Components,
            Services,
            ComponentMiddlewaresProps,
            Compositions,
            CompositionMiddlewaresProps
        >,
    ) {}

    private ContentAreaRenderer: React.FC<
        ContentAreaRendererProps<Components, Compositions, Services>
    > = createContentAreaRenderer(
        this.compositionRegistrar,
        this.compositionRegistrar.componentRegistrar.logger,
    )

    private CompositionRenderer: React.FC<
        CompositionRendererProps<
            Components,
            Compositions,
            Services,
            ComponentMiddlewaresProps,
            CompositionMiddlewaresProps
        >
    > = createCompositionRenderer(
        this.compositionRegistrar,
        this.ContentAreaRenderer,
        this.compositionRegistrar.componentRegistrar.logger,
    )

    CompositionsRenderer: React.FC<
        Props<Components, Compositions, Services, CompositionMiddlewaresProps>
    > = createCompositionsRenderer(
        this,
        this.compositionRegistrar,
        this.CompositionRenderer,
        this.compositionRegistrar.componentRegistrar.logger,
    )

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

    composition(composition: Compositions & CompositionMiddlewaresProps) {
        return composition
    }

    compositions(
        ...compositions: Array<Compositions & CompositionMiddlewaresProps>
    ): Compositions[] {
        return compositions
    }
}
