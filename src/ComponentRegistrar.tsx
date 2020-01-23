import React from 'react'
import { Logger, noopLogger } from 'typescript-log'

import { ComponentProps } from './ComponentRenderer'
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

// Collection of errors that can be thrown by the ComponentRegistrar
export const Errors = {
    missing: (component: string) => `Component '${component}' has not been registered`,
}

/**
 * Allows regisration of components to render in composition content areas in
 * a type safe way
 *
 * @example new ComponentRegistrar().register(myComponentRegistration)
 */
export class ComponentRegistrar<
    Services extends {},
    Components extends ComponentInformation<any> = never,
    ComponentMiddlewaresProps extends object = {}
> {
    static displayName = 'ComponentRegistrar'

    // the internal collection of registered components
    private registeredComponents: {
        [key: string]: ComponentRegistration<any, any, Services>
    } = {}
    private _componentMiddlewares: Array<
        ComponentRendererMiddleware<Services, ComponentMiddlewaresProps>
    > = []

    public get componentMiddleware(): ComponentRendererMiddleware<
        Services,
        ComponentMiddlewaresProps
    > {
        const pipeline = (
            props: ComponentProps,
            middlewareProps: ComponentMiddlewaresProps,
            services: MiddlwareServices<Services>,
            ...steps: Array<ComponentRendererMiddleware<Services, ComponentMiddlewaresProps>>
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
            return pipeline(
                props,
                middlewareProps,
                services,
                ...this._componentMiddlewares,
                (cp, mp, s) => {
                    return next(cp, mp, s)
                },
            )
        }
    }

    constructor(public logger: Logger = noopLogger()) {}

    isRegistered = (type: Components['type']) => {
        return this.registeredComponents[type] !== undefined
    }

    /**
     * expects the type from T to be passed in as a parameter, from this we
     * can retrieve the render function associated with the component
     */
    get = (
        type: Components['type'],
    ):
        | ComponentRegistration<
              Components['type'],
              Extract<Components, { type: Components['type'] }>,
              Services
          >
        | undefined => {
        const foundComponent = this.registeredComponents[type]
        if (!foundComponent && process.env.NODE_ENV !== 'production') {
            // continue rendering in production only. otherwise throw, this is so the site does not crash
            // empty area will be rendered instead
            this.logger.warn(Errors.missing(type))
        }
        return foundComponent
    }

    /** used to register another component using ComponentRegistration<TType, TProps> */
    registerComponent<TType extends string, TProps extends {}>(
        registration: ComponentRegistration<TType, TProps, Services>,
    ): Pick<
        ComponentRegistrar<
            Services,
            Exclude<Components, never> | ComponentInformation<TType, TProps>,
            ComponentMiddlewaresProps
        >,
        'registerComponent' | 'registerMiddleware'
    > {
        if (this.registeredComponents[registration.type]) {
            throw new Error(`${registration.type} has already been registered`)
        }

        this.registeredComponents[registration.type] = registration

        return this as any
    }

    registerMiddleware<TRegistrationMiddlewareProps extends object>(
        componentMiddleware: ComponentRendererMiddleware<Services, TRegistrationMiddlewareProps>,
    ): ComponentRegistrar<
        Services,
        Components,
        ComponentMiddlewaresProps & TRegistrationMiddlewareProps
    > {
        // This cast is safe because we are correctly typing the return type
        this._componentMiddlewares.push(componentMiddleware as any)

        return this as any
    }
}
