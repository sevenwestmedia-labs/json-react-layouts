import React from 'react'
import {
    ComponentRegistrar,
    RenderFunctionServices,
    ComponentRendererMiddleware,
} from './ComponentRegistrar'
import { LayoutApi } from './RouteBuilder'

export interface ComponentProps {
    componentType: string
    componentRenderPath: string
    [props: string]: any
}

export interface Props<Services> {
    type: string
    layoutApi: LayoutApi<any, any, any, any>
    componentRegistrar: ComponentRegistrar<Services, any, any>
    componentProps: ComponentProps
    middlewareProps: { [props: string]: any }
    services: Services

    /** Allows a middleware to be specified for component rendering */
    renderComponentMiddleware?: ComponentRendererMiddleware<Services, any>
}

export const ComponentRenderer: React.FC<Props<any>> = props => {
    const component = props.componentRegistrar.get(props.type)
    if (component === undefined) {
        return null
    }

    const componentServices: RenderFunctionServices<any> = {
        services: props.services,
        layout: props.layoutApi,
    }

    function render() {
        const rendered = component.render(props.componentProps, componentServices) || null

        return rendered
    }

    if (props.renderComponentMiddleware) {
        const middlewareRender =
            props.renderComponentMiddleware(
                props.componentProps,
                props.middlewareProps,
                componentServices,
                render,
            ) || null

        return middlewareRender
    }

    return render()
}
ComponentRenderer.displayName = 'ComponentRenderer'
