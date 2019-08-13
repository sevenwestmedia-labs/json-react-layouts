import React from 'react'
import {
    ComponentRegistrar,
    RenderFunctionServices,
    ComponentRendererMiddleware,
} from './ComponentRegistrar'
import { RouteBuilder } from './RouteBuilder'

export interface ComponentProps {
    componentRenderPath: string
    [props: string]: any
}

export interface Props<TLoadDataServices> {
    type: string
    routeBuilder: RouteBuilder<any, any, any, any>
    componentRegistrar: ComponentRegistrar<TLoadDataServices, any>
    componentProps: ComponentProps
    middlewareProps: { [props: string]: any }
    loadDataServices: TLoadDataServices

    /** Allows a middleware to be specified for component rendering */
    renderComponentMiddleware?: ComponentRendererMiddleware<TLoadDataServices, any>
}

export const ComponentRenderer: React.FC<Props<any>> = props => {
    const component = props.componentRegistrar.get(props.type)
    if (component === undefined) {
        return null
    }

    const componentServices: RenderFunctionServices<any> = {
        loadDataServices: props.loadDataServices,
        routeBuilder: props.routeBuilder,
    }

    function render() {
        return component.render(props.componentProps, componentServices) || null
    }

    if (props.renderComponentMiddleware) {
        return (
            props.renderComponentMiddleware(
                props.componentProps,
                props.middlewareProps,
                componentServices,
                render,
            ) || null
        )
    }
    return render()
}
ComponentRenderer.displayName = 'ComponentRenderer'
