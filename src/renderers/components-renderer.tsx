import React from 'react'
import { ComponentInformation, ComponentRegistrations } from '../ComponentRegistrar'
import { LayoutApi } from '../LayoutApi'
import { ComponentRenderer } from './component-renderer'
import { ComponentRendererMiddleware } from '../middlewares'

interface ComponentsRendererProps {
    layoutApi: LayoutApi<any, any, any, any>
    components: Array<ComponentInformation<any, any>>
    componentRegistrations: ComponentRegistrations
    componentMiddleware: ComponentRendererMiddleware<any, any>
    services: any
}

const ComponentsRenderer: React.FC<ComponentsRendererProps> = ({
    components,
    services,
    layoutApi,
    componentRegistrations,
    componentMiddleware,
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
                            ...componentProps,
                            componentType: item.type,
                            componentRenderPath: `[${index}]`,
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
