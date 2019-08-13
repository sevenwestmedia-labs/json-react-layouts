import React from 'react'

import {
    ComponentInformation,
    Errors,
    ComponentRegistrar,
    componentFactory,
} from './ComponentRegistrar'
import { RouteBuilder } from './RouteBuilder'

import { ComponentRenderer } from './ComponentRenderer'

/** Creates a registerable composition, it is a two step process due to TypeScript limitations
 *
 * First createRegisterableComponent<'main'|'sidebar'>() creates a registration function
 * for a composition with two content areas, main and sidebar.
 * Second call that registration function to create the registration.
 */

export function createRegisterableComposition<TContentAreas extends string, TProps extends {}>() {
    return <TType extends string>(
        type: TType,
        render: CompositionRenderFunction<TContentAreas, TProps>,
    ): CompositionRegistration<TType, TContentAreas, TProps> => ({ type, render })
}

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

export type RenderFunction<T extends ComponentInformation<any, TProps>, TProps = T['props']> = (
    props: TProps,
) => React.ReactElement<any>
export type CompositionRenderFunction<TContentAreas extends string, TProps> = (renderProps: {
    props: TProps
    contentAreas: { [key in TContentAreas]: React.ReactElement<any> }
}) => React.ReactElement<any>

export interface NestedCompositionProps {
    composition: CompositionInformation<any, any, any, any>
    componentRenderPath: string
}

export class CompositionRegistrar<
    TCompositions extends CompositionInformation<any, any, any>,
    TComponents extends ComponentInformation<any>,
    TLoadDataServices,
    TMiddlewareProps extends {}
> {
    /** Static constructor function due to type inference */
    static create<
        TRegisteredComponents extends ComponentInformation<any>,
        LoadDataServices,
        MiddlewareProps extends {}
    >(
        componentRegistrar: ComponentRegistrar<
            LoadDataServices,
            TRegisteredComponents,
            MiddlewareProps
        >,
    ) {
        const registrar = new CompositionRegistrar<
            never,
            | TRegisteredComponents
            | ComponentInformation<'nested-composition', NestedCompositionProps>,
            LoadDataServices,
            MiddlewareProps
        >(componentRegistrar as any)
        const { createRegisterableComponent } = componentFactory<LoadDataServices>()

        // Nested compositions, we register a composition renderer as a component
        registrar.componentRegistrar.register(
            createRegisterableComponent(
                'nested-composition',
                (props: NestedCompositionProps, services) => {
                    if (props.composition.type === 'nested-composition') {
                        throw new Error(
                            "nested-composition is registered as a component, it is not allowed within a nested composition as it's not a composition, please check the route",
                        )
                    }
                    return (
                        <registrar.CompositionRenderer
                            compositionInformation={props.composition}
                            componentRenderPath={`${props.componentRenderPath}/nested:${
                                props.composition.type
                            }`}
                            loadDataServices={services.loadDataServices}
                            // Think of this as a late bound type, right now it is invalid
                            // (no compositions registered), but the routebuilder cannot be constructed
                            // if this is the case
                            routeBuilder={services.routeBuilder as any}
                        />
                    )
                },
            ),
        )
        return registrar
    }

    private registeredCompositions: {
        [key: string]: {
            render: CompositionRenderFunction<any, any>
        }
    } = {}

    private constructor(
        public componentRegistrar: ComponentRegistrar<TLoadDataServices, TComponents>,
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
        | Exclude<TCompositions, never>
        | CompositionInformation<TType, TComponents, TContentAreas, TProps>,
        TComponents,
        TLoadDataServices,
        TMiddlewareProps
    > {
        if (this.registeredCompositions[registration.type]) {
            throw new Error(`${registration.type} has already been registered`)
        }

        this.registeredCompositions[registration.type] = {
            render: registration.render as any,
        }

        return this as any
    }

    CompositionRenderer: React.FC<
        CompositionRendererProps<
            TCompositions,
            TComponents & TMiddlewareProps,
            TLoadDataServices,
            TMiddlewareProps
        >
    > = (props): React.ReactElement<any> | null => {
        /**
         * The ContentAreaRenderer componentRenderPaths need to append `/[contentArea key]'
         * key as this logic is duped outside of react for the ssr
         */
        this.componentRegistrar.logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                type: props.compositionInformation.type,
            },
            'Rendering composition',
        )

        const contentAreas = Object.keys(props.compositionInformation.contentAreas).reduce<{
            [key: string]: React.ReactElement<any>
        }>((acc, val) => {
            acc[val] = (
                <this.ContentAreaRenderer
                    componentRenderPath={`${props.componentRenderPath}/${val}`}
                    contentArea={props.compositionInformation.contentAreas[val]}
                    routeBuilder={props.routeBuilder}
                    loadDataServices={props.loadDataServices}
                />
            )
            return acc
        }, {})
        const compositionProps: CompositionRenderProps<any, any, TLoadDataServices> = {
            contentAreas,
            props: props.compositionInformation.props,
        }
        const compositionElement = this.get(props.compositionInformation.type)
        return compositionElement(compositionProps)
    }

    ContentAreaRenderer: React.FC<
        ContentAreaRendererProps<TCompositions, TComponents & TMiddlewareProps, TLoadDataServices>
    > = (props): React.ReactElement<any> => {
        this.componentRegistrar.logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                components: props.contentArea.map(component => ({
                    type: component.type,
                })),
            },
            'Rendering content area',
        )

        return (
            <React.Fragment>
                {props.contentArea.map((item, index) => {
                    const { type, props: componentProps, ...middlewareProps } = item
                    return (
                        <ComponentRenderer
                            key={`${item.type}-${index}`}
                            type={type}
                            routeBuilder={props.routeBuilder}
                            componentRegistrar={this.componentRegistrar}
                            componentProps={{
                                ...componentProps,
                                componentRenderPath: `${props.componentRenderPath}[${index}]`,
                            }}
                            middlewareProps={middlewareProps}
                            loadDataServices={props.loadDataServices}
                            renderComponentMiddleware={this.componentRegistrar.componentMiddleware}
                        />
                    )
                })}
            </React.Fragment>
        )
    }
}

export interface CompositionRendererProps<
    TCompositions extends CompositionInformation<any, any, any>,
    TComponents extends ComponentInformation<any> & TMiddlewareProps,
    LoadDataServices,
    TMiddlewareProps extends {}
> {
    componentRenderPath: string
    compositionInformation: CompositionInformation<any, TComponents, any>
    routeBuilder: RouteBuilder<TCompositions, TComponents, LoadDataServices, TMiddlewareProps>
    loadDataServices: LoadDataServices
}

export interface ContentAreaRendererProps<
    TCompositions extends CompositionInformation<any, any, any>,
    TComponents extends ComponentInformation<any>,
    LoadDataServices
> {
    componentRenderPath: string
    contentArea: TComponents[]
    routeBuilder: RouteBuilder<TCompositions, TComponents, LoadDataServices, any>
    loadDataServices: LoadDataServices
}
