import React from 'react'
import { ComponentRegistrations } from '../ComponentRegistrar'
import { CompositionInformation, CompositionRegistrations } from '../CompositionRegistrar'
import { Logger } from 'typescript-log'
import { LayoutApi } from '../LayoutApi'
import { MiddlwareServices, RendererMiddleware } from '../middlewares'
import { ComponentsRenderer } from './components-renderer'

export interface CompositionRendererProps {
    componentRenderPath: string
    composition: CompositionInformation<any, any, any>
    componentMiddleware: RendererMiddleware<any, any>
    componentRegistrations: ComponentRegistrations
    compositionMiddleware: RendererMiddleware<any, any>
    compositionRegistrations: CompositionRegistrations
    layoutApi: LayoutApi<any, any, any, any, any>
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

    const compositionRegistration = compositionRegistrations.get(composition.type)

    if (!compositionRegistration) {
        return null
    }

    // A middleware may call next with props, we should use them
    function render(middlewareCompositionProps?: any) {
        const compositionRenderProps = middlewareCompositionProps || compositionProps
        const contentAreas = Object.keys(composition.contentAreas).reduce<{
            [key: string]: React.ReactElement<any>
        }>((acc, contentAreaName) => {
            const componentsRenderPath = `${componentRenderPath}/${contentAreaName}`
            log.debug(
                {
                    componentsRenderPath,
                    components: composition.contentAreas[contentAreaName].map(component => ({
                        type: component.type,
                    })),
                },
                'Rendering content area',
            )

            const additionalProps = compositionRegistration?.componentProps
                ? compositionRegistration?.componentProps({
                      contentArea: contentAreaName,
                      props: compositionRenderProps,
                  })
                : {}
            acc[contentAreaName] = (
                <ComponentsRenderer
                    componentMiddleware={componentMiddleware}
                    componentRegistrations={componentRegistrations}
                    componentRenderPath={componentsRenderPath}
                    components={composition.contentAreas[contentAreaName]}
                    layoutApi={layoutApi}
                    services={services}
                    additionalComponentProps={additionalProps}
                />
            )
            return acc
        }, {})

        const rendered =
            compositionRegistration!.render(contentAreas, compositionRenderProps, services) || null

        return rendered
    }

    const middlewareRender =
        compositionMiddleware(composition.props, middlewareProps, componentServices, render) || null

    return middlewareRender
}
CompositionRenderer.displayName = 'CompositionRenderer'
