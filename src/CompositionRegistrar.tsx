import React from 'react'

import {
    ComponentInformation,
    Errors,
    ComponentRegistrar,
    RenderFunction,
} from './ComponentRegistrar'
import { LayoutApi } from './LayoutApi'

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
    Components extends ComponentInformation<any>,
    Services,
    ComponentMiddlewaresProps extends object,
    Compositions extends CompositionInformation<any, any, any> = never
> {
    static displayName = 'CompositionRegistrar'

    private registeredCompositions: {
        [key: string]: {
            render: CompositionRenderFunction<any, any>
        }
    } = {}

    constructor(
        public componentRegistrar: ComponentRegistrar<
            Services,
            Components,
            ComponentMiddlewaresProps
        >,
    ) {}

    get(type: Compositions['type']) {
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
        Components,
        Services,
        ComponentMiddlewaresProps,
        | Exclude<Compositions, never>
        | CompositionInformation<TType, Components, TContentAreas, TProps>
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
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, any, any>,
    Services,
    ComponentMiddlewaresProps extends object
> {
    componentRenderPath: string
    composition: CompositionInformation<any, Components, any>
    layoutApi: LayoutApi<Components, Compositions, Services, ComponentMiddlewaresProps>
    services: Services
}

export interface ContentAreaRendererProps<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, any, any>,
    Services
> {
    componentRenderPath: string
    contentArea: Components[]
    layoutApi: LayoutApi<Components, Compositions, Services, any>
    services: Services
}
