import React from 'react'
import { Logger, noopLogger } from 'typescript-log'

import { RouteBuilder } from './RouteBuilder'
import { ComponentProps, ComponentRenderer } from './ComponentRenderer'
import { CompositionRegistrar } from './CompositionRegistrar'

export interface ComponentRegistration<TType extends string, TProps extends {}, LoadDataServices> {
    type: TType
    render: RenderFunction<TProps, LoadDataServices>
}

export function componentFactory<TLoadDataServices>() {
    return {
        /** Helper function to create the registration (to infer types) */
        createRegisterableComponent<TType extends string, TProps extends {}>(
            type: TType,
            render: RenderFunction<TProps, TLoadDataServices>,
        ): ComponentRegistration<TType, TProps, TLoadDataServices> {
            return { type, render }
        },
    }
}

/** A component definition inside route definitions */
export interface ComponentInformation<TType, TProps = {}> {
    type: TType
    props: TProps
}

export interface RenderFunctionServices<LoadDataServices> {
    routeBuilder: RouteBuilder<any, any, any, any>
    loadDataServices: LoadDataServices
}

/** The render function for components, converts the route props into a react component */
export type RenderFunction<TProps, LoadDataServices> = (
    props: TProps,
    services: RenderFunctionServices<LoadDataServices>,
) => React.ReactElement<any> | false | null

// Collection of errors that can be thrown by the ComponentRegistrar
export const Errors = {
    missing: (component: string) => `Component '${component}' has not been registered`,
}

/**
 * Allows regisration of components to render in composition content areas in
 * a type safe way
 *
 * @example ComponentRegistrar.register(myComponentRegistration)
 */
export class ComponentRegistrar<
    TLoadDataServices extends {},
    TComponents extends ComponentInformation<any> = never,
    TMiddlewareProps extends object = {}
> {
    // the internal collection of registered components
    private registeredComponents: {
        [key: string]: ComponentRegistration<any, any, TLoadDataServices>
    } = {}
    private _componentMiddlewares: ComponentRendererMiddleware<
        TLoadDataServices,
        TMiddlewareProps
    >[] = []

    public get componentMiddleware(): ComponentRendererMiddleware<
        TLoadDataServices,
        TMiddlewareProps
    > {
        const pipeline = (
            props: ComponentProps,
            middlewareProps: TMiddlewareProps,
            services: RenderFunctionServices<TLoadDataServices>,
            ...steps: ComponentRendererMiddleware<TLoadDataServices, TMiddlewareProps>[]
        ): React.ReactElement<any> | false | null => {
            const [step, ...next] = steps
            return step
                ? step(props, middlewareProps, services, () =>
                      pipeline(props, middlewareProps, services, ...next),
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

    isRegistered = (type: TComponents['type']) => {
        return this.registeredComponents[type] !== undefined
    }

    /**
     * expects the type from T to be passed in as a parameter, from this we
     * can retrieve the render function associated with the component
     */
    get = (type: TComponents['type']) => {
        const foundComponent = this.registeredComponents[type]
        if (!foundComponent && process.env.NODE_ENV !== 'production') {
            // continue rendering in production only. otherwise throw, this is so the site does not crash
            // empty area will be rendered instead
            this.logger.warn(Errors.missing(type))
        }
        return foundComponent
    }

    /** used to register another component using ComponentRegistration<TType, TProps> */
    register<TType extends string, TProps extends {}>(
        registration: ComponentRegistration<TType, TProps, TLoadDataServices>,
    ): ComponentRegistrar<
        TLoadDataServices,
        Exclude<TComponents, never> | ComponentInformation<TType, TProps>
    > {
        if (this.registeredComponents[registration.type]) {
            throw new Error(`${registration.type} has already been registered`)
        }

        this.registeredComponents[registration.type] = registration

        return this as any
    }

    registerMiddleware<TRegistrationMiddlewareProps extends object>(
        componentMiddleware: ComponentRendererMiddleware<
            TLoadDataServices,
            TRegistrationMiddlewareProps
        >,
    ): ComponentRegistrar<
        TLoadDataServices,
        TComponents,
        TMiddlewareProps & TRegistrationMiddlewareProps
    > {
        // This cast is safe because we are correctly typing the return type
        this._componentMiddlewares.push(componentMiddleware as any)

        return this as any
    }

    createRenderer(): React.FC<{
        components: TComponents[]
        loadDataServices: TLoadDataServices
    }> {
        const compositionRegistrar = CompositionRegistrar.create(this as any)
        const routeBuilder = new RouteBuilder(compositionRegistrar) as any

        const ComponentsRenderer: React.FC<{
            components: TComponents[]
            loadDataServices: TLoadDataServices
        }> = ({ components, loadDataServices }) => {
            return (
                <React.Fragment>
                    {components.map((item, index) => {
                        const { type, props: componentProps, ...middlewareProps } = item
                        return (
                            <ComponentRenderer
                                key={`${item.type}-${index}`}
                                type={type}
                                routeBuilder={routeBuilder}
                                componentRegistrar={this as any}
                                componentProps={{
                                    ...componentProps,
                                    componentRenderPath: `[${index}]`,
                                }}
                                middlewareProps={middlewareProps}
                                loadDataServices={loadDataServices}
                                renderComponentMiddleware={this.componentMiddleware}
                            />
                        )
                    })}
                </React.Fragment>
            )
        }
        ComponentsRenderer.displayName = 'ComponentsRenderer'

        return ComponentsRenderer
    }
}

// const Renderer = new ComponentRegistrar().createRenderer()

// <Renderer components={[]}

/** The render function for components, converts the route props into a react component */
export type MiddlwareHandler<TProps, TMiddlewareProps extends object, LoadDataServices> = (
    props: TProps,
    middlewareProps: TMiddlewareProps,
    services: RenderFunctionServices<LoadDataServices>,
) => React.ReactElement<any> | false | null

export type ComponentRendererMiddleware<TLoadDataServices, TMiddlewareProps extends object> = (
    componentProps: ComponentProps,
    middlewareProps: TMiddlewareProps,
    services: RenderFunctionServices<TLoadDataServices>,
    next: MiddlwareHandler<ComponentProps, TMiddlewareProps, TLoadDataServices>,
) => React.ReactElement<any> | false | null
