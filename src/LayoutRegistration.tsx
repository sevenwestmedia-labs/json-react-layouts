import React from 'react'
import {
    ComponentInformation,
    ComponentRegistrationBuilderStart,
    ComponentRegistrationBuilder,
    ComponentRegistration,
    ComponentRegistrations,
} from './ComponentRegistrar'
import {
    CompositionInformation,
    CompositionRegistrations,
    CompositionRegistration,
} from './CompositionRegistrar'
import { Logger, noopLogger } from 'typescript-log'
import {
    ComponentRendererMiddleware,
    getRegistrationCreators,
    CompositionRendererMiddleware,
    LayoutApi,
} from '.'
import { CompositionRenderer } from './renderers/composition-renderer'

interface RegisterComponentsStep<Services extends object> {
    registerComponents<
        Components extends ComponentInformation<any, any>,
        ComponentMiddlewares extends object
    >(
        registerCallback: (
            registrar: ComponentRegistrationBuilderStart<Services>,
        ) => ComponentRegistrationBuilder<Services, Components, ComponentMiddlewares>,
        log?: Logger,
    ): RegisterCompositionsStep<Components, ComponentMiddlewares, Services>
}

export interface CompositionRegistrationBuilderStart<
    Components extends ComponentInformation<any>,
    ComponentMiddlewaresProps extends {},
    Services
> {
    registerComposition<TType extends string, TContentAreas extends string, TProps>(
        registration: CompositionRegistration<TType, TContentAreas, Services, TProps>,
    ): CompositionRegistrationBuilder<
        Components,
        ComponentMiddlewaresProps,
        CompositionInformation<TType, Components, TContentAreas, TProps>,
        {},
        Services
    >
}

export interface CompositionRegistrationBuilder<
    Components extends ComponentInformation<any, any>,
    ComponentMiddlewaresProps extends {},
    Compositions extends CompositionInformation<any, any, any>,
    CompositionMiddlewaresProps extends {},
    Services
> {
    registerComposition<TType extends string, TContentAreas extends string, TProps>(
        registration: CompositionRegistration<TType, TContentAreas, Services, TProps>,
    ): CompositionRegistrationBuilder<
        Components,
        ComponentMiddlewaresProps,
        Compositions | CompositionInformation<TType, Components, TContentAreas, TProps>,
        CompositionMiddlewaresProps,
        Services
    >

    registerMiddleware<TRegistrationMiddlewareProps extends object>(
        compositionMiddleware: CompositionRendererMiddleware<
            Services,
            TRegistrationMiddlewareProps
        >,
    ): CompositionRegistrationBuilder<
        Components,
        ComponentMiddlewaresProps,
        Compositions,
        CompositionMiddlewaresProps & TRegistrationMiddlewareProps,
        Services
    >
}

interface RegisterCompositionsStep<
    Components extends ComponentInformation<any, any>,
    ComponentMiddlewares extends object,
    Services extends object
> {
    registerCompositions<
        Compositions extends CompositionInformation<any, Components, any, any>,
        CompositionMiddlewaresProps extends object
    >(
        registerCallback: (
            registrar: CompositionRegistrationBuilderStart<
                Components,
                ComponentMiddlewares,
                Services
            >,
        ) => CompositionRegistrationBuilder<
            Components,
            ComponentMiddlewares,
            Compositions,
            CompositionMiddlewaresProps,
            Services
        >,
    ): LayoutApi<
        ComponentsWithNested<Components, ComponentMiddlewares>,
        Compositions,
        ComponentMiddlewares,
        CompositionMiddlewaresProps
    >
}

export function LayoutRegistration<Services extends object = {}>(): RegisterComponentsStep<
    Services
> {
    return {
        registerComponents<
            Components extends ComponentInformation<any, any>,
            ComponentMiddlewares extends object
        >(
            registerCallback: (
                registrar: ComponentRegistrationBuilderStart<Services>,
            ) => ComponentRegistrationBuilder<Services, Components, ComponentMiddlewares>,
            log: Logger = noopLogger(),
        ): RegisterCompositionsStep<Components, ComponentMiddlewares, Services> {
            // the internal collection of registered components
            const registeredComponents: {
                [key: string]: ComponentRegistration<any, any, Services>
            } = {}
            const componentMiddlewares: Array<ComponentRendererMiddleware<Services, any>> = []

            const builder: ComponentRegistrationBuilder<Services, any, any> = {
                registerComponent: registration => {
                    if (registeredComponents[registration.type]) {
                        throw new Error(`${registration.type} has already been registered`)
                    }

                    registeredComponents[registration.type] = registration
                    return builder
                },
                registerMiddleware: componentMiddleware => {
                    componentMiddlewares.push(componentMiddleware)
                    return builder
                },
            }

            registerCallback({
                registerComponent: registration => {
                    if (registeredComponents[registration.type]) {
                        throw new Error(`${registration.type} has already been registered`)
                    }

                    registeredComponents[registration.type] = registration
                    return builder
                },
            })

            // the following exposes registerCompositions
            return {
                registerCompositions<
                    Compositions extends CompositionInformation<any, Components, any, any>,
                    CompositionMiddlewaresProps extends object
                >(
                    registerCallback: (
                        registrar: CompositionRegistrationBuilderStart<
                            Components,
                            ComponentMiddlewares,
                            Services
                        >,
                    ) => CompositionRegistrationBuilder<
                        Components,
                        ComponentMiddlewares,
                        Compositions,
                        CompositionMiddlewaresProps,
                        Services
                    >,
                ): LayoutApi<
                    ComponentsWithNested<Components, ComponentMiddlewares>,
                    Compositions,
                    ComponentMiddlewares,
                    CompositionMiddlewaresProps
                > {
                    const registeredCompositions: {
                        [key: string]: CompositionRegistration<any, any, Services, any>
                    } = {}
                    const compositionMiddlewares: Array<CompositionRendererMiddleware<
                        Services,
                        any
                    >> = []

                    const componentRegistrations: ComponentRegistrations = {
                        isRegistered(type: string) {
                            return registeredComponents[type] !== undefined
                        },
                        get(type: string) {
                            const foundComponent = registeredComponents[type]
                            if (!foundComponent && process.env.NODE_ENV !== 'production') {
                                // continue rendering in production only. otherwise throw, this is so the site does not crash
                                // empty area will be rendered instead
                                log.warn({ type }, `Component has not been registered`)
                            }
                            return foundComponent
                        },
                    }
                    const compositionRegistrations: CompositionRegistrations = {
                        get(type: string) {
                            const foundComposition = registeredCompositions[type]
                            if (!foundComposition && process.env.NODE_ENV !== 'production') {
                                // Warn a component is missing if not in production
                                log.warn({ type }, `Composition has not been registered`)
                            }
                            return foundComposition
                        },
                    }
                    const layout: LayoutApi<any, any, any, any> = {
                        _componentType: undefined as any,
                        _compositionType: undefined as any,

                        component(component: ComponentInformation<any, any>) {
                            return component
                        },

                        components(...components: Array<ComponentInformation<any, any>>) {
                            return components
                        },

                        composition(composition: CompositionInformation<any, any, any>) {
                            return composition
                        },

                        compositions(
                            ...compositions: Array<CompositionInformation<any, any, any>>
                        ) {
                            return compositions
                        },
                    }
                    const { createRegisterableComponent } = getRegistrationCreators<Services>()
                    const middlewares: {
                        component: ComponentRendererMiddleware<any, any>
                        composition: CompositionRendererMiddleware<any, any>
                    } = {
                        component: () => null,
                        composition: () => null,
                    }

                    builder.registerComponent(
                        createRegisterableComponent(
                            'nested-composition',
                            (props: NestedCompositionProps<any, any>, services) => {
                                if (props.composition.type === 'nested-composition') {
                                    throw new Error(
                                        "nested-composition is registered as a component, it is not allowed within a nested composition as it's not a composition, please check the route",
                                    )
                                }

                                return (
                                    <CompositionRenderer
                                        composition={props.composition}
                                        componentRenderPath={`${props.componentRenderPath}nested:${props.composition.type}`}
                                        services={services}
                                        layoutApi={layout}
                                        componentRegistrations={componentRegistrations}
                                        compositionRegistrations={compositionRegistrations}
                                        componentMiddleware={middlewares.component}
                                        compositionMiddleware={middlewares.composition}
                                        log={log}
                                    />
                                )
                            },
                        ),
                    )

                    const compositionBuilder: CompositionRegistrationBuilder<
                        any,
                        any,
                        any,
                        any,
                        Services
                    > = {
                        registerComposition(registration) {
                            if (registeredCompositions[registration.type]) {
                                throw new Error(`${registration.type} has already been registered`)
                            }

                            registeredCompositions[registration.type] = registration
                            return compositionBuilder
                        },
                        registerMiddleware(compositionMiddleware) {
                            compositionMiddlewares.push(compositionMiddleware)
                            return compositionBuilder
                        },
                    }

                    registerCallback(compositionBuilder)

                    return layout
                },
            }
        },
    }
}

export interface NestedCompositionProps<
    Components extends ComponentInformation<any, any>,
    ComponentMiddlewares extends object
> {
    composition: CompositionInformation<any, Components, any, any> & ComponentMiddlewares
    componentRenderPath: string
}

export interface NestedComposition<
    Components extends ComponentInformation<any, any>,
    ComponentMiddlewares extends object
>
    extends ComponentInformation<
        'nested-composition',
        NestedCompositionProps<
            ComponentsWithNested<Components, ComponentMiddlewares>,
            ComponentMiddlewares
        >
    > {
        contentAreas:
    }

/** Recursive type for nested components */
export type ComponentsWithNested<
    Components extends ComponentInformation<any, any>,
    ComponentMiddlewares extends object
> = NestedComposition<Components, ComponentMiddlewares> | Components
