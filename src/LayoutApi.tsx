import React from 'react'
import { ComponentInformation } from './ComponentRegistrar'
import {
    CompositionInformation,
    CompositionRegistrar,
    CompositionRendererProps,
    CompositionRenderProps,
    ContentAreaRendererProps,
} from './CompositionRegistrar'
import { createCompositionsRenderer, Props } from './CompositionsRenderer'
import { ComponentRenderer } from './ComponentRenderer'

export type CompositionRenderer<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    LoadDataServices,
    ComponentMiddlewaresProps extends {}
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
    ComponentMiddlewaresProps extends {}
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
    > = (props): React.ReactElement<any> | null => {
        /**
         * The ContentAreaRenderer componentRenderPaths need to append `/[contentArea key]'
         * key as this logic is duped outside of react for the ssr
         */
        this.compositionRegistrar.componentRegistrar.logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                type: props.compositionInformation.type,
            },
            'Rendering composition',
        )

        const contentAreas = Object.keys(props.compositionInformation.contentAreas).reduce<{
            [key: string]: React.ReactElement<any>
        }>((acc, val) => {
            acc[val] = (
                <this.ContentAreaRenderer
                    componentRenderPath={`${props.componentRenderPath}/${val}`}
                    contentArea={props.compositionInformation.contentAreas[val]}
                    layoutApi={props.layoutApi}
                    services={props.services}
                />
            )
            return acc
        }, {})
        const compositionProps: CompositionRenderProps<any, any, Services> = {
            contentAreas,
            props: props.compositionInformation.props,
        }
        const compositionElement = this.compositionRegistrar.get(props.compositionInformation.type)
        return compositionElement(compositionProps)
    }

    ContentAreaRenderer: React.FC<ContentAreaRendererProps<Components, Compositions, Services>> = (
        props,
    ): React.ReactElement<any> => {
        this.compositionRegistrar.componentRegistrar.logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                components: props.contentArea.map(component => ({
                    type: component.type,
                })),
            },
            'Rendering content area',
        )

        return (
            <React.Fragment>
                {props.contentArea.map((item, index) => {
                    const { type, props: componentProps, ...middlewareProps } = item
                    return (
                        <ComponentRenderer
                            // TODO allow components to be re-orderered without remounting
                            key={`${item.type}-${index}`}
                            type={type}
                            layoutApi={props.layoutApi}
                            componentRegistrar={this.compositionRegistrar.componentRegistrar}
                            componentProps={{
                                ...componentProps,
                                componentType: item.type,
                                componentRenderPath: `${props.componentRenderPath}[${index}]`,
                            }}
                            middlewareProps={middlewareProps}
                            services={props.services}
                            renderComponentMiddleware={
                                this.compositionRegistrar.componentRegistrar.componentMiddleware
                            }
                        />
                    )
                })}
            </React.Fragment>
        )
    }

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

    contentArea(...components: Components[]): Array<ComponentInformation<any>> {
        return components
    }

    composition(composition: Compositions) {
        return composition
    }

    compositions(...compositions: Compositions[]): Compositions[] {
        return compositions
    }
}
