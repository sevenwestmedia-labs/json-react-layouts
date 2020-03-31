import React from 'react'
import { ComponentRegistrations } from '../ComponentRegistrar'
import { LayoutApi } from '../LayoutApi'
import { ComponentRendererMiddleware, MiddlwareServices, MiddlwareHandler } from '../middlewares'

export interface ComponentProps {
    componentType: string
    componentRenderPath: string
    [props: string]: any
}

export interface ComponentRendererProps {
    type: string
    layoutApi: LayoutApi<any, any, any, any>
    componentRegistrations: ComponentRegistrations
    componentProps: ComponentProps
    middlewareProps: { [props: string]: any }
    services: any
    componentMiddleware: ComponentRendererMiddleware<any, any>
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
    type,
    componentRegistrations,
    componentProps,
    middlewareProps,
    componentMiddleware,
    services,
    layoutApi,
}) => {
    const component = componentRegistrations.get(type)
    if (component === undefined) {
        return null
    }

    const componentServices: MiddlwareServices<any> = {
        services: services,
        layout: layoutApi,
    }

    // A middleware may call next with props, we should use them
    const render: MiddlwareHandler<any, any, any> = (
        middlewareComponentProps: ComponentProps,
        _,
        services,
    ) => {
        // component! because we have checked if it's undefined above
        // We are just in a callback here so TypeScript does not maintain the narrowing
        const rendered =
            component!.render(middlewareComponentProps || componentProps, services.services) || null

        return rendered
    }

    const middlewareRender =
        componentMiddleware(componentProps, middlewareProps, componentServices, render) || null

    return middlewareRender
}
ComponentRenderer.displayName = 'ComponentRenderer'
