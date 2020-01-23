import React from 'react'
import { ComponentRegistrar } from './ComponentRegistrar'
import { LayoutApi } from './LayoutApi'
import { ComponentRendererMiddleware, MiddlwareServices, MiddlwareHandler } from './middlewares'

export interface ComponentProps {
    componentType: string
    componentRenderPath: string
    [props: string]: any
}

export interface ComponentRendererProps<Services> {
    type: string
    layoutApi: LayoutApi<any, any, any, any, any>
    componentRegistrar: ComponentRegistrar<Services, any, any>
    componentProps: ComponentProps
    middlewareProps: { [props: string]: any }
    services: Services

    /** Allows a middleware to be specified for component rendering */
    renderComponentMiddleware: ComponentRendererMiddleware<Services, any>
}

export const ComponentRenderer: React.FC<ComponentRendererProps<any>> = props => {
    const component = props.componentRegistrar.get(props.type)
    if (component === undefined) {
        return null
    }

    const componentServices: MiddlwareServices<any> = {
        services: props.services,
        layout: props.layoutApi,
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
            component!.render(
                middlewareComponentProps || props.componentProps,
                services.services,
            ) || null

        return rendered
    }

    const middlewareRender =
        props.renderComponentMiddleware(
            props.componentProps,
            props.middlewareProps,
            componentServices,
            render,
        ) || null

    return middlewareRender
}
ComponentRenderer.displayName = 'ComponentRenderer'
