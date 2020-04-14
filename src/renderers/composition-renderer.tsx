import React from 'react'
import { ComponentInformation, ComponentRegistrations } from '../ComponentRegistrar'
import { CompositionInformation, CompositionRegistrations } from '../CompositionRegistrar'
import { Logger } from 'typescript-log'
import { LayoutApi } from '../LayoutApi'
import { MiddlwareServices, RendererMiddleware } from '../middlewares'
import { ComponentsRenderer } from './components-renderer'

export interface CompositionRendererProps {
    componentRenderPath: string
    composition: CompositionInformation<any, any, any, any>
    componentMiddleware: RendererMiddleware<any, any>
    componentRegistrations: ComponentRegistrations
    compositionMiddleware: RendererMiddleware<any, any>
    compositionRegistrations: CompositionRegistrations
    layoutApi: LayoutApi<any, any, any, any>
    services: any
    log: Logger
}

export const CompositionRenderer: React.FunctionComponent<CompositionRendererProps> = ({
    services,
    layoutApi,
    componentRenderPath,
    composition,
    compositionMiddleware,
    componentRegistrations,
    componentMiddleware,
    compositionRegistrations,
    log,
}): React.ReactElement<any> | null => {
    /**
     * The ContentAreaRenderer componentRenderPaths need to append `/[contentArea key]'
     * key as this logic is duped outside of react for the ssr
     */
    log.debug(
        {
            componentRenderPath: componentRenderPath,
            type: composition.type,
        },
        'Rendering composition',
    )

    const { contentAreas, props: compositionProps, ...middlewareProps } = composition

    const componentServices: MiddlwareServices<any> = {
        services: services,
        layout: layoutApi,
    }

    const compositionElement = compositionRegistrations.get(composition.type)

    if (!compositionElement) {
        return null
    }

    // A middleware may call next with props, we should use them
    function render(middlewareCompositionProps?: any) {
        const contentAreas = Object.keys(composition.contentAreas).reduce<{
            [key: string]: React.ReactElement<any>
        }>((acc, val) => {
            const componentsRenderPath = `${componentRenderPath}/${val}`
            log.debug(
                {
                    componentsRenderPath,
                    components: composition.contentAreas[val].map((component) => ({
                        type: component.type,
                    })),
                },
                'Rendering content area',
            )

            acc[val] = (
                <ComponentsRenderer
                    componentMiddleware={componentMiddleware}
                    componentRegistrations={componentRegistrations}
                    componentRenderPath={componentsRenderPath}
                    components={composition.contentAreas[val]}
                    layoutApi={layoutApi}
                    services={services}
                />
            )
            return acc
        }, {})

        const rendered =
            compositionElement!.render(
                contentAreas,
                middlewareCompositionProps || compositionProps,
                services,
            ) || null

        return rendered
    }

    const middlewareRender =
        compositionMiddleware(composition.props, middlewareProps, componentServices, render) || null

    return middlewareRender
}
CompositionRenderer.displayName = 'CompositionRenderer'
