import React from 'react'
import { Logger } from 'typescript-log'

import { ComponentInformation, ComponentRegistrations } from '../ComponentRegistrar'
import { ComponentRenderer } from './component-renderer'
import { LayoutApi } from '../LayoutApi'
import { ComponentRendererMiddleware } from '../middlewares'

export interface ContentAreaRendererProps {
    componentRenderPath: string
    contentArea: Array<ComponentInformation<any, any>>
    componentMiddleware: ComponentRendererMiddleware<any, any>
    componentRegistrations: ComponentRegistrations
    services: any
    layoutApi: LayoutApi<any, any, any, any>
    log: Logger
}

export const ContentAreaRenderer: React.FC<ContentAreaRendererProps> = ({
    componentRenderPath,
    componentRegistrations,
    componentMiddleware,
    log,
    contentArea,
    layoutApi,
    services,
}): React.ReactElement<any> => {
    log.debug(
        {
            componentRenderPath: componentRenderPath,
            components: contentArea.map(component => ({
                type: component.type,
            })),
        },
        'Rendering content area',
    )

    return (
        <React.Fragment>
            {contentArea.map((item, index) => {
                const { type, props: componentProps, ...middlewareProps } = item
                return (
                    <ComponentRenderer
                        key={item.renderKey || index}
                        type={type}
                        layoutApi={layoutApi}
                        componentRegistrations={componentRegistrations}
                        componentProps={{
                            ...componentProps,
                            componentType: item.type,
                            componentRenderPath: `${componentRenderPath}/[${index}]`,
                        }}
                        middlewareProps={middlewareProps}
                        services={services}
                        componentMiddleware={componentMiddleware}
                    />
                )
            })}
        </React.Fragment>
    )
}
ContentAreaRenderer.displayName = 'ContentAreaRenderer'
