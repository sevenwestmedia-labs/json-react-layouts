import React from 'react'
import { ComponentRegistrar, RenderFunctionServices, RenderFunction } from './ComponentRegistrar'
import { RouteBuilder } from './RouteBuilder'
import { ComponentState } from './DataLoading'

export type ComponentRendererMiddleware<TLoadDataServices> = (
    props: Props<TLoadDataServices>,
    services: RenderFunctionServices<TLoadDataServices>,
    next: RenderFunction<any, TLoadDataServices>,
) => React.ReactElement<any> | false | null

export interface Props<TLoadDataServices> {
    type: string
    routeBuilder: RouteBuilder<any, any, any, any>
    componentRegistrar: ComponentRegistrar<TLoadDataServices, any>
    componentProps: { componentRenderPath: string; dataDefinitionsArg?: any; [props: string]: any }
    loadDataServices: TLoadDataServices

    /** Allows a middleware to be specified for component rendering */
    renderComponentMiddleware?: ComponentRendererMiddleware<TLoadDataServices>
}

export const ComponentRenderer: React.FC<Props<any>> = props => {
    const component = props.componentRegistrar.get(props.type)
    if (component === undefined) {
        return null
    }

    const componentDataDefinition = props.componentRegistrar.getDataDefinition(props.type)

    const componentServices: RenderFunctionServices<any> = {
        loadDataServices: props.loadDataServices,
        routeBuilder: props.routeBuilder,
    }

    function render() {
        if (componentDataDefinition) {
            return (
                <props.routeBuilder.ComponentDataLoader
                    componentRegistrar={props.componentRegistrar}
                    componentRenderPath={props.componentProps.componentRenderPath}
                    dataDefinition={componentDataDefinition}
                    dataDefinitionArgs={props.componentProps.dataDefinitionArgs}
                    renderData={renderProps => {
                        if (!renderProps.lastAction.success) {
                            // We have failed to load data, use error boundaries
                            // to send error back up and render error page
                            throw renderProps.lastAction.error
                        }

                        const data: ComponentState<any> = renderProps.data.hasData
                            ? { data: { loaded: true, result: renderProps.data.result } }
                            : { data: { loaded: false } }

                        return (
                            component.render(
                                {
                                    ...props.componentProps,
                                    ...data,
                                },
                                componentServices,
                            ) || null
                        )
                    }}
                />
            )
        }
        return component.render(props.componentProps, componentServices) || null
    }

    if (props.renderComponentMiddleware) {
        return props.renderComponentMiddleware(props, componentServices, render) || null
    }
    return render()
}
ComponentRenderer.displayName = 'ComponentRenderer'
