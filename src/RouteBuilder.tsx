import { ComponentInformation } from './ComponentRegistrar'
import {
    CompositionInformation,
    CompositionRegistrar,
    CompositionRendererProps,
    CompositionRenderProps,
    ContentAreaRendererProps,
} from './CompositionRegistrar'
import { createCompositionsRenderer, Props } from './CompositionsRenderer'
import React from 'react'
import { ComponentRenderer } from './ComponentRenderer'

export type CompositionRenderer<
    TComponents extends ComponentInformation<any>,
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    LoadDataServices,
    TMiddlewareProps extends {}
> = React.FC<
    CompositionRendererProps<TComponents, TCompositions, LoadDataServices, TMiddlewareProps>
>

/**
 * Renders and type helpers for completed registrations
 */
export class LayoutApi<
    TComponents extends ComponentInformation<any>,
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    Services,
    TMiddlewareProps extends {}
> {
    _compositionType!: TCompositions
    _componentType!: TComponents & TMiddlewareProps
    _contentAreaType!: TComponents[]

    CompositionsRenderer: React.FC<
        Props<TComponents, TCompositions, Services>
    > = createCompositionsRenderer(this, this.compositionRegistrar.componentRegistrar.logger)

    CompositionRenderer: CompositionRenderer<
        TComponents,
        TCompositions,
        Services,
        TMiddlewareProps
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

    ContentAreaRenderer: React.FC<
        ContentAreaRendererProps<TComponents, TCompositions, Services>
    > = (props): React.ReactElement<any> => {
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
            TComponents,
            Services,
            TMiddlewareProps,
            TCompositions
        >,
    ) {}

    component(component: TComponents & TMiddlewareProps) {
        return component
    }

    /** Nested compositions are special components
     * You need to use this function to create them then pass them as a component
     */
    nestedComposition(composition: TCompositions): ComponentInformation<any, any> {
        return {
            type: 'nested-composition',
            props: { composition },
        }
    }

    contentArea(...components: TComponents[]): Array<ComponentInformation<any>> {
        return components
    }

    composition(composition: TCompositions) {
        return composition
    }

    compositions(...compositions: TCompositions[]): TCompositions[] {
        return compositions
    }
}
