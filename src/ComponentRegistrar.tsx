import React from 'react'
import { Logger, noopLogger } from 'typescript-log'

import { ComponentProps } from './renderers/component-renderer'
import { ComponentRendererMiddleware, MiddlwareServices } from './middlewares'

export interface ComponentRegistration<
    ComponentType extends string,
    ComponentProps extends {},
    Services
> {
    type: ComponentType
    render: RenderFunction<ComponentProps, Services>
}

export interface WithRenderKey {
    /** Provide a custom React render key */
    renderKey?: string
}

/** A component definition inside route definitions */
export interface ComponentInformation<ComponentType, ComponentProps = {}> extends WithRenderKey {
    type: ComponentType
    props: ComponentProps
}

/** The render function for components, converts the route props into a react component */
export type RenderFunction<ComponentProps, Services> = (
    props: ComponentProps,
    services: Services,
) => React.ReactElement<any> | false | null

/** Initial component registration builder */
export interface ComponentRegistrationBuilderStart<Services extends {}> {
    registerComponent<TType extends string, TProps extends {}>(
        registration: ComponentRegistration<TType, TProps, Services>,
    ): ComponentRegistrationBuilder<Services, ComponentInformation<TType, TProps>, {}>
}

/** Component registration builder */
export interface ComponentRegistrationBuilder<
    Services extends {},
    Components extends ComponentInformation<any>,
    ComponentMiddlewaresProps extends object
> {
    registerComponent<TType extends string, TProps extends {}>(
        registration: ComponentRegistration<TType, TProps, Services>,
    ): ComponentRegistrationBuilder<
        Services,
        Components | ComponentInformation<TType, TProps>,
        ComponentMiddlewaresProps
    >

    registerMiddleware<TRegistrationMiddlewareProps extends object>(
        componentMiddleware: ComponentRendererMiddleware<Services, TRegistrationMiddlewareProps>,
    ): ComponentRegistrationBuilder<
        Services,
        Components,
        ComponentMiddlewaresProps & TRegistrationMiddlewareProps
    >
}

export interface ComponentRegistrations {
    isRegistered(type: string): boolean

    /**
     * expects the type from T to be passed in as a parameter, from this we
     * can retrieve the render function associated with the component
     */
    get(type: string): ComponentRegistration<string, any, any> | undefined
}

function composeComponentMiddleware<Services extends {}, ComponentMiddlewaresProps extends object>(
    componentMiddlewares: Array<ComponentRendererMiddleware<Services, any>>,
): ComponentRendererMiddleware<Services, ComponentMiddlewaresProps> {
    const pipeline = (
        props: ComponentProps,
        middlewareProps: any,
        services: MiddlwareServices<Services>,
        ...steps: Array<ComponentRendererMiddleware<Services, any>>
    ): React.ReactElement<any> | false | null => {
        const [step, ...next] = steps
        return step
            ? step(
                  props,
                  middlewareProps,
                  services,
                  (stepProps, stepMiddlewareProps, stepServices) =>
                      pipeline(stepProps, stepMiddlewareProps, stepServices, ...next),
              )
            : null
    }

    return (props, middlewareProps, services, next) => {
        return pipeline(props, middlewareProps, services, ...componentMiddlewares, (cp, mp, s) => {
            return next(cp, mp, s)
        })
    }
}
