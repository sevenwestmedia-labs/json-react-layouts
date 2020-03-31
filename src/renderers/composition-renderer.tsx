import React from 'react'
import { ComponentInformation, ComponentRegistrations } from '../ComponentRegistrar'
import { CompositionInformation, CompositionRegistrations } from '../CompositionRegistrar'
import { Logger } from 'typescript-log'
import { LayoutApi } from '../LayoutApi'
import {
    CompositionRendererMiddleware,
    MiddlwareServices,
    ComponentRendererMiddleware,
} from '../middlewares'
import { ContentAreaRenderer } from './content-area-renderer'

export interface CompositionRendererProps {
    componentRenderPath: string
    composition: CompositionInformation<any, any, any>
    componentMiddleware: ComponentRendererMiddleware<any, any>
    componentRegistrations: ComponentRegistrations
    compositionMiddleware: CompositionRendererMiddleware<any, any>
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
            acc[val] = (
                <ContentAreaRenderer
                    componentMiddleware={componentMiddleware}
                    componentRegistrations={componentRegistrations}
                    componentRenderPath={`${componentRenderPath}/${val}`}
                    contentArea={composition.contentAreas[val]}
                    layoutApi={layoutApi}
                    services={services}
                    log={log}
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
