import React from 'react'
import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { Logger } from 'typescript-log'
import { LayoutApi } from './LayoutApi'
import { CompositionRendererMiddleware, MiddlwareServices } from './middlewares'
import { ContentAreaRendererProps } from './ContentAreaRenderer'

export interface CompositionRendererProps<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, any, any>,
    Services,
    ComponentMiddlewaresProps extends object,
    CompositionMiddlewaresProps extends object
> {
    componentRenderPath: string
    composition: CompositionInformation<any, Components, any> & CompositionMiddlewaresProps
    layoutApi: LayoutApi<
        Components,
        Compositions,
        Services,
        ComponentMiddlewaresProps,
        CompositionMiddlewaresProps
    >
    services: Services

    /** Allows a middleware to be specified for composition rendering */
    renderCompositionMiddleware: CompositionRendererMiddleware<Services, any>
}

export function createCompositionRenderer<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services,
    ComponentMiddlewaresProps extends object,
    CompositionMiddlewaresProps extends object
>(
    compositionRegistrar: CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        Compositions,
        CompositionMiddlewaresProps
    >,
    ContentAreaRenderer: React.FC<ContentAreaRendererProps<Components, Compositions, Services>>,
    logger: Logger,
) {
    const CompositionRenderer: React.FunctionComponent<
        CompositionRendererProps<
            Components,
            Compositions,
            Services,
            ComponentMiddlewaresProps,
            CompositionMiddlewaresProps
        >
    > = (props): React.ReactElement<any> | null => {
        /**
         * The ContentAreaRenderer componentRenderPaths need to append `/[contentArea key]'
         * key as this logic is duped outside of react for the ssr
         */
        logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                type: props.composition.type,
            },
            'Rendering composition',
        )

        const { contentAreas, props: compositionProps, ...middlewareProps } = props.composition

        const componentServices: MiddlwareServices<any> = {
            services: props.services,
            layout: props.layoutApi,
        }

        const compositionElement = compositionRegistrar.get(props.composition.type)

        // A middleware may call next with props, we should use them
        function render(middlewareCompositionProps?: any) {
            const contentAreas = Object.keys(props.composition.contentAreas).reduce<{
                [key: string]: React.ReactElement<any>
            }>((acc, val) => {
                acc[val] = (
                    <ContentAreaRenderer
                        componentRenderPath={`${props.componentRenderPath}/${val}`}
                        contentArea={props.composition.contentAreas[val]}
                        layoutApi={props.layoutApi}
                        services={props.services}
                    />
                )
                return acc
            }, {})

            const rendered =
                compositionElement(
                    contentAreas,
                    middlewareCompositionProps || compositionProps,
                    props.services,
                ) || null

            return rendered
        }

        const middlewareRender =
            props.renderCompositionMiddleware(
                props.composition.props,
                middlewareProps,
                componentServices,
                render,
            ) || null

        return middlewareRender
    }
    CompositionRenderer.displayName = 'CompositionRenderer'
    return CompositionRenderer
}
