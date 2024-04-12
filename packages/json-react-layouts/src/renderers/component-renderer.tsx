import React from 'react'
import { ComponentRegistrations } from '../ComponentRegistrar'
import { LayoutApi } from '../LayoutApi'
import { RendererMiddleware, MiddlwareServices, MiddlwareHandler } from '../middlewares'
import { jrlDebug } from '../log'

export interface ComponentProps {
    componentType: string
    componentRenderPath: string
    [props: string]: any
}

export interface ComponentRendererProps {
    type: string
    layoutApi: LayoutApi<any, any, any, any, any>
    componentRegistrations: ComponentRegistrations
    componentProps: ComponentProps
    middlewareProps: { [props: string]: any }
    services: any
    componentMiddleware: RendererMiddleware<any, any>
}

const componentDebug = jrlDebug.extend('component')

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
        const props = middlewareComponentProps || componentProps
        componentDebug('Rendering: %o', { type: component.type, props })
        const rendered = component.render(props, services.services) || null

        return rendered
    }

    const { componentType, componentRenderPath, ...rest } = componentProps

    const middlewareRender =
        componentMiddleware(
            { layoutType: componentType, renderPath: componentRenderPath, ...rest },
            middlewareProps,
            componentServices,
            render,
        ) || null

    return middlewareRender
}
ComponentRenderer.displayName = 'ComponentRenderer'
