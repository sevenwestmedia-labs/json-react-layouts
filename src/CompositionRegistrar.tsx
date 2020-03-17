import React from 'react'

import {
    ComponentInformation,
    Errors,
    ComponentRegistrar,
    RenderFunction,
} from './ComponentRegistrar'
import { CompositionRendererMiddleware, MiddlwareServices } from './middlewares'

export interface CompositionRenderProps<TContentAreas, TProps, TLoadDataServices> {
    contentAreas: { [key in keyof TContentAreas]: React.ReactElement<any> }
    props: TProps

    /** Allows a middleware to be specified for component rendering */
    renderCompositionMiddleware?: (
        props: CompositionRenderProps<TContentAreas, TProps, TLoadDataServices>,
        next: RenderFunction<any, TLoadDataServices>,
    ) => React.ReactElement<any> | false | null
}

export interface CompositionInformation<
    TType extends string,
    TComponentInformation,
    TContentAreas extends string,
    TProps = {}
> extends ComponentInformation<TType, TProps> {
    type: TType
    props: TProps
    contentAreas: { [name in TContentAreas]: TComponentInformation[] }
}

export interface CompositionRegistration<
    TType,
    TContentAreas extends string,
    Services,
    TProps = {}
> {
    type: TType
    render: CompositionRenderFunction<TContentAreas, TProps, Services>
}

export type CompositionRenderFunction<TContentAreas extends string, TProps, Services> = (
    contentAreas: { [key in TContentAreas]: React.ReactElement<any> },
    renderProps: TProps,
    services: Services,
) => React.ReactElement<any> | false | null

export interface NestedCompositionProps {
    composition: CompositionInformation<any, any, any, any>
    componentRenderPath: string
}

export class CompositionRegistrar<
    Components extends ComponentInformation<any>,
    Services,
    ComponentMiddlewaresProps extends object,
    Compositions extends CompositionInformation<any, any, any>,
    CompositionsMiddlewaresProps extends object
> {
    static displayName = 'CompositionRegistrar'

    private registeredCompositions: {
        [key: string]: {
            render: CompositionRenderFunction<any, any, Services>
        }
    } = {}
    private _compositionMiddlewares: Array<
        CompositionRendererMiddleware<Services, CompositionsMiddlewaresProps>
    > = []

    constructor(
        public componentRegistrar: ComponentRegistrar<
            Services,
            Components,
            ComponentMiddlewaresProps
        >,
    ) {}

    get(type: Compositions['type']) {
        const foundComposition = this.registeredCompositions[type]
        if (!foundComposition && process.env.NODE_ENV !== 'production') {
            // Warn a component is missing if not in production
            this.componentRegistrar.logger.warn(Errors.missing(type))
        }
        return foundComposition.render
    }

    public get componentMiddleware(): CompositionRendererMiddleware<
        Services,
        CompositionsMiddlewaresProps
    > {
        const pipeline = (
            props: {},
            middlewareProps: CompositionsMiddlewaresProps,
            services: MiddlwareServices<Services>,
            ...steps: Array<CompositionRendererMiddleware<Services, CompositionsMiddlewaresProps>>
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
                ...this._compositionMiddlewares,
                (cp, mp, s) => {
                    return next(cp, mp, s)
                },
            )
        }
    }

    registerComposition<TType extends string, TContentAreas extends string, TProps>(
        registration: CompositionRegistration<TType, TContentAreas, Services, TProps>,
    ): CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        | Exclude<Compositions, never>
        | CompositionInformation<TType, Components, TContentAreas, TProps>,
        CompositionsMiddlewaresProps
    > {
        if (this.registeredCompositions[registration.type]) {
            throw new Error(`${registration.type} has already been registered`)
        }

        this.registeredCompositions[registration.type] = {
            render: registration.render as any,
        }

        return this as any
    }

    registerMiddleware<TRegistrationMiddlewareProps extends object>(
        compositionMiddleware: CompositionRendererMiddleware<
            Services,
            TRegistrationMiddlewareProps
        >,
    ): CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        Compositions,
        CompositionsMiddlewaresProps & TRegistrationMiddlewareProps
    > {
        // This cast is safe because we are correctly typing the return type
        this._compositionMiddlewares.push(compositionMiddleware as any)

        return this as any
    }
}
