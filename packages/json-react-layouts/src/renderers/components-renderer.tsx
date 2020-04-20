import React from 'react'
import { ComponentInformation, ComponentRegistrations } from '../ComponentRegistrar'
import { LayoutApi } from '../LayoutApi'
import { ComponentRenderer } from './component-renderer'
import { RendererMiddleware } from '../middlewares'

interface ComponentsRendererProps {
    layoutApi: LayoutApi<any, any, any, any, any>
    components: Array<ComponentInformation<any, any>>
    componentRegistrations: ComponentRegistrations
    componentMiddleware: RendererMiddleware<any, any>
    componentRenderPath: string
    /** Adds props to all rendered components */
    additionalComponentProps: {}
    services: any
}

export const ComponentsRenderer: React.FC<ComponentsRendererProps> = ({
    components,
    services,
    layoutApi,
    componentRegistrations,
    componentMiddleware,
    componentRenderPath,
    additionalComponentProps,
}) => {
    return (
        <React.Fragment>
            {components.map((item, index) => {
                const { type, props: componentProps, ...middlewareProps } = item
                return (
                    <ComponentRenderer
                        key={item.renderKey || index}
                        type={type}
                        layoutApi={layoutApi}
                        componentRegistrations={componentRegistrations}
                        componentProps={{
                            ...additionalComponentProps,
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
ComponentsRenderer.displayName = 'ComponentsRenderer'
