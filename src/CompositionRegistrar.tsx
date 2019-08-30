import React from 'react'

import {
    ComponentInformation,
    Errors,
    ComponentRegistrar,
    RenderFunction,
} from './ComponentRegistrar'
import { LayoutApi } from './RouteBuilder'

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

export interface CompositionRegistration<TType, TContentAreas extends string, TProps = {}> {
    type: TType
    render: CompositionRenderFunction<TContentAreas, TProps>
}

export type CompositionRenderFunction<TContentAreas extends string, TProps> = (renderProps: {
    props: TProps
    contentAreas: { [key in TContentAreas]: React.ReactElement<any> }
}) => React.ReactElement<any>

export interface NestedCompositionProps {
    composition: CompositionInformation<any, any, any, any>
    componentRenderPath: string
}

export class CompositionRegistrar<
    TComponents extends ComponentInformation<any>,
    TLoadDataServices,
    TMiddlewareProps extends {},
    TCompositions extends CompositionInformation<any, any, any> = never
> {
    private registeredCompositions: {
        [key: string]: {
            render: CompositionRenderFunction<any, any>
        }
    } = {}

    constructor(
        public componentRegistrar: ComponentRegistrar<
            TLoadDataServices,
            TComponents,
            TMiddlewareProps
        >,
    ) {}

    get(type: TCompositions['type']) {
        const foundComponent = this.registeredCompositions[type]
        if (!foundComponent && process.env.NODE_ENV !== 'production') {
            // Warn a component is missing if not in production
            this.componentRegistrar.logger.warn(Errors.missing(type))
        }
        return foundComponent.render
    }

    registerComposition<TType extends string, TContentAreas extends string, TProps>(
        registration: CompositionRegistration<TType, TContentAreas, TProps>,
    ): CompositionRegistrar<
        TComponents,
        TLoadDataServices,
        TMiddlewareProps,
        | Exclude<TCompositions, never>
        | CompositionInformation<TType, TComponents, TContentAreas, TProps>
    > {
        if (this.registeredCompositions[registration.type]) {
            throw new Error(`${registration.type} has already been registered`)
        }

        this.registeredCompositions[registration.type] = {
            render: registration.render as any,
        }

        return this as any
    }
}

export interface CompositionRendererProps<
    TComponents extends ComponentInformation<any>,
    TCompositions extends CompositionInformation<any, any, any>,
    Services,
    TMiddlewareProps extends {}
> {
    componentRenderPath: string
    compositionInformation: CompositionInformation<any, TComponents, any>
    layoutApi: LayoutApi<TComponents, TCompositions, Services, TMiddlewareProps>
    services: Services
}

export interface ContentAreaRendererProps<
    TComponents extends ComponentInformation<any>,
    TCompositions extends CompositionInformation<any, any, any>,
    Services
> {
    componentRenderPath: string
    contentArea: TComponents[]
    layoutApi: LayoutApi<TComponents, TCompositions, Services, any>
    services: Services
}
