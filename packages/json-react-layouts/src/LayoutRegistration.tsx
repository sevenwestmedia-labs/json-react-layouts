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
import { RendererMiddleware, getRegistrationCreators, LayoutApi } from '.'
import { CompositionRenderer } from './renderers/composition-renderer'
import { CompositionsRenderer } from './renderers/compositions-renderer'
import { composeMiddleware } from './middlewares'
import { ComponentsRenderer } from './renderers/components-renderer'

interface RegisterComponentsStep<Services extends {}> {
    registerComponents<
        Components extends ComponentInformation<any, any>,
        ComponentMiddlewares extends {}
    >(
        registerCallback: (
            registrar: ComponentRegistrationBuilderStart<Services>,
        ) => ComponentRegistrationBuilder<Services, Components, ComponentMiddlewares>,
    ): RegisterCompositionsStep<Components, ComponentMiddlewares, Services>
}

export interface CompositionRegistrationBuilderStart<
    Components extends ComponentInformation<any, any>,
    ComponentMiddlewaresProps extends {},
    Services
> {
    registerComposition<TType extends string, TContentAreas extends string, TProps>(
        registration: CompositionRegistration<TType, TContentAreas, Services, TProps>,
    ): CompositionRegistrationBuilder<
        Components,
        ComponentMiddlewaresProps,
        CompositionInformation<TType, TContentAreas, TProps>,
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
        Compositions | CompositionInformation<TType, TContentAreas, TProps>,
        CompositionMiddlewaresProps,
        Services
    >

    registerMiddleware<TRegistrationMiddlewareProps extends {}>(
        compositionMiddleware: RendererMiddleware<Services, TRegistrationMiddlewareProps>,
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
    ComponentMiddlewaresProps extends {},
    Services extends {}
> {
    registerCompositions<
        Compositions extends CompositionInformation<any, any, any>,
        CompositionMiddlewaresProps extends {}
    >(
        registerCallback: (
            registrar: CompositionRegistrationBuilderStart<
                Components,
                ComponentMiddlewaresProps,
                Services
            >,
        ) => CompositionRegistrationBuilder<
            Components,
            ComponentMiddlewaresProps,
            Compositions,
            CompositionMiddlewaresProps,
            Services
        >,
    ): LayoutApi<
        Components,
        Compositions,
        ComponentMiddlewaresProps,
        CompositionMiddlewaresProps,
        Services
    >
}

export function LayoutRegistration<Services extends {}>(): RegisterComponentsStep<Services> {
    return {
        registerComponents<
            Components extends ComponentInformation<any, any>,
            ComponentMiddlewares extends {}
        >(
            registerCallback: (
                registrar: ComponentRegistrationBuilderStart<Services>,
            ) => ComponentRegistrationBuilder<Services, Components, ComponentMiddlewares>,
        ): RegisterCompositionsStep<Components, ComponentMiddlewares, Services> {
            // the internal collection of registered components
            const registeredComponents: {
                [key: string]: ComponentRegistration<any, any, Services>
            } = {}
            const componentMiddlewares: Array<RendererMiddleware<Services, any>> = []

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
                    Compositions extends CompositionInformation<any, any, any>,
                    CompositionMiddlewaresProps extends {}
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
                    Components,
                    Compositions,
                    ComponentMiddlewares,
                    CompositionMiddlewaresProps,
                    Services
                > {
                    const registeredCompositions: {
                        [key: string]: CompositionRegistration<any, any, Services, any>
                    } = {}
                    const compositionMiddlewares: Array<RendererMiddleware<Services, any>> = []

                    const componentRegistrations: ComponentRegistrations = {
                        isRegistered(type: string) {
                            return registeredComponents[type] !== undefined
                        },
                        get(type: string) {
                            const foundComponent = registeredComponents[type]
                            if (!foundComponent && process.env.NODE_ENV !== 'production') {
                                // continue rendering in production only. otherwise throw, this is so the site does not crash
                                // empty area will be rendered instead
                                console.warn({ type }, `Component has not been registered`)
                            }
                            return foundComponent
                        },
                    }
                    const compositionRegistrations: CompositionRegistrations = {
                        get(type: string) {
                            const foundComposition = registeredCompositions[type]
                            if (!foundComposition && process.env.NODE_ENV !== 'production') {
                                // Warn a component is missing if not in production
                                console.warn({ type }, `Composition has not been registered`)
                            }
                            return foundComposition
                        },
                    }

                    const { createRegisterableComponent } = getRegistrationCreators<Services>()
                    const middlewares: {
                        component: RendererMiddleware<any, any>
                        composition: RendererMiddleware<any, any>
                    } = {
                        component: () => null,
                        composition: () => null,
                    }

                    const layout: LayoutApi<any, any, any, any, Services> = {
                        componentRegistrations,
                        compositionRegistrations,

                        component(component) {
                            return component as any
                        },
                        composition(composition) {
                            return composition as any
                        },
                        nestedComposition(composition) {
                            return {
                                type: 'nested-composition',
                                props: { composition: composition },
                            } as any
                        },

                        createRenderers({ services }) {
                            return {
                                renderComponents(...components) {
                                    return (
                                        <ComponentsRenderer
                                            layoutApi={layout}
                                            componentMiddleware={middlewares.component}
                                            componentRegistrations={componentRegistrations}
                                            services={services}
                                            components={components}
                                            componentRenderPath=""
                                            additionalComponentProps={{}}
                                        />
                                    )
                                },

                                renderCompositions(...compositions) {
                                    return (
                                        <CompositionsRenderer
                                            layoutApi={layout}
                                            componentMiddleware={middlewares.component}
                                            compositionMiddleware={middlewares.composition}
                                            componentRegistrations={componentRegistrations}
                                            compositionRegistrations={compositionRegistrations}
                                            services={services}
                                            compositions={compositions}
                                        />
                                    )
                                },
                            }
                        },
                    }

                    builder.registerComponent(
                        createRegisterableComponent(
                            'nested-composition',
                            (
                                {
                                    composition,
                                    componentRenderPath,
                                    ...additionalComponentProps
                                }: NestedCompositionProps<any>,
                                services,
                            ) => {
                                if (composition.type === 'nested-composition') {
                                    throw new Error(
                                        "nested-composition is registered as a component, it is not allowed within a nested composition as it's not a composition, please check the route",
                                    )
                                }

                                return (
                                    <CompositionRenderer
                                        composition={composition}
                                        componentRenderPath={`${componentRenderPath}nested:${composition.type}`}
                                        services={services}
                                        layoutApi={layout}
                                        componentRegistrations={componentRegistrations}
                                        compositionRegistrations={compositionRegistrations}
                                        componentMiddleware={middlewares.component}
                                        compositionMiddleware={middlewares.composition}
                                        additionalComponentProps={additionalComponentProps}
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

                    middlewares.component = composeMiddleware(componentMiddlewares)
                    middlewares.composition = composeMiddleware(compositionMiddlewares)

                    return layout
                },
            }
        },
    }
}

export interface NestedCompositionProps<
    Compositions extends CompositionInformation<any, any, any>
> {
    composition: Compositions
    componentRenderPath?: string
}

export type ComponentCheckedMessage = 'wrap in layout.component()'
export type CompositionCheckedMessage = 'wrap in layout.composition()'
