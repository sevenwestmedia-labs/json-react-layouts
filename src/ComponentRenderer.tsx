import React from 'react'
import { ComponentRegistrar, RenderFunctionServices } from './ComponentRegistrar'
import { RouteBuilder } from './RouteBuilder'
import { ComponentState } from './DataLoading'

export interface Props<LoadDataServices> {
    type: string
    routeBuilder: RouteBuilder<any, any, any>
    componentRegistrar: ComponentRegistrar<LoadDataServices, any>
    componentProps: { componentRenderPath: string; dataDefinition?: any; [props: string]: any }
    loadDataServices: LoadDataServices
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

    if (componentDataDefinition) {
        return (
            <props.routeBuilder.ComponentDataLoader
                componentRegistrar={props.componentRegistrar}
                componentRenderPath={props.componentProps.componentRenderPath}
                dataDefinition={componentDataDefinition}
                dataDefinitionArgs={props.componentProps.dataDefinition}
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
ComponentRenderer.displayName = 'ComponentRenderer'
