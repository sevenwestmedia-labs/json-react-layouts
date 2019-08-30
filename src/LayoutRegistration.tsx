import React from 'react'
import { ComponentRegistrar, ComponentInformation } from './ComponentRegistrar'
import {
    CompositionRegistrar,
    CompositionInformation,
    NestedCompositionProps,
} from './CompositionRegistrar'
import { LayoutApi } from './RouteBuilder'
import { getRegistrationCreators } from './get-registration-creators'
import { Logger, noopLogger } from 'typescript-log'
import { ComponentRenderer } from './ComponentRenderer'

export class LayoutRegistration<Services = {}> {
    constructor(private logger: Logger = noopLogger()) {}

    registerComponents<
        Components extends ComponentInformation<any, any> = never,
        ComponentMiddlewares extends object = {}
    >(
        registerCallback: (
            registrar: Pick<
                ComponentRegistrar<Services, never, {}>,
                'registerComponent' | 'registerMiddleware'
            >,
        ) => Pick<
            ComponentRegistrar<Services, Components, ComponentMiddlewares>,
            'registerComponent' | 'registerMiddleware'
        >,
    ): LayoutCompositionRegistration<Components, ComponentMiddlewares, Services> {
        const regisrar = new ComponentRegistrar<Services, never, {}>(this.logger)

        const unmaskedComponentRegistrar = registerCallback(regisrar) as ComponentRegistrar<
            Services,
            Components,
            ComponentMiddlewares
        >

        return new LayoutCompositionRegistration(unmaskedComponentRegistrar)
    }
}

type NestedComponentInfo = ComponentInformation<'nested-composition', NestedCompositionProps>

export class LayoutCompositionRegistration<
    Components extends ComponentInformation<any>,
    ComponentMiddlewares extends {},
    Services
> {
    constructor(
        private componentRegistrar: ComponentRegistrar<Services, Components, ComponentMiddlewares>,
    ) {}

    /** Returns a components renderer component which can render a list of components */
    createComponentsRenderer(): React.FC<{
        components: Array<Components & ComponentMiddlewares>
        services: Services
    }> {
        const layoutApi = this.registerCompositions(registrar => registrar) as any

        interface ComponentsRendererProps {
            components: Array<Components & ComponentMiddlewares>
            services: Services
        }

        const ComponentsRenderer: React.FC<ComponentsRendererProps> = ({
            components,
            services,
        }) => {
            return (
                <React.Fragment>
                    {components.map((item, index) => {
                        const { type, props: componentProps, ...middlewareProps } = item
                        return (
                            <ComponentRenderer
                                key={`${item.type}-${index}`}
                                type={type}
                                layoutApi={layoutApi}
                                componentRegistrar={this.componentRegistrar}
                                componentProps={{
                                    ...componentProps,
                                    componentType: item.type,
                                    componentRenderPath: `[${index}]`,
                                }}
                                middlewareProps={middlewareProps}
                                services={services}
                                renderComponentMiddleware={
                                    this.componentRegistrar.componentMiddleware
                                }
                            />
                        )
                    })}
                </React.Fragment>
            )
        }
        ComponentsRenderer.displayName = 'ComponentsRenderer'

        return ComponentsRenderer
    }

    registerCompositions<Compositions extends CompositionInformation<any, any, any>>(
        registerCallback: (
            registrar: Pick<
                CompositionRegistrar<
                    Components | ComponentInformation<'nested-composition', NestedCompositionProps>,
                    Services,
                    ComponentMiddlewares
                >,
                'registerComposition'
            >,
        ) => Pick<
            CompositionRegistrar<
                Components | ComponentInformation<'nested-composition', NestedCompositionProps>,
                Services,
                ComponentMiddlewares,
                Exclude<Compositions, never>
            >,
            'registerComposition'
        >,
    ): LayoutApi<
        Components | NestedComponentInfo,
        Exclude<Compositions, never>,
        Services,
        ComponentMiddlewares
    > {
        const { createRegisterableComponent } = getRegistrationCreators<Services>()

        const registrarWithNestedComposition = this.componentRegistrar.registerComponent(
            createRegisterableComponent(
                'nested-composition',
                (props: NestedCompositionProps, services) => {
                    if (props.composition.type === 'nested-composition') {
                        throw new Error(
                            "nested-composition is registered as a component, it is not allowed within a nested composition as it's not a composition, please check the route",
                        )
                    }

                    return (
                        <CompositionRenderer
                            compositionInformation={props.composition}
                            componentRenderPath={`${props.componentRenderPath}/nested:${props.composition.type}`}
                            services={services.services}
                            // Think of this as a late bound type, right now it is invalid
                            // (no compositions registered), but the routebuilder cannot be constructed
                            // if this is the case
                            layoutApi={services.layout as any}
                        />
                    )
                },
            ),
        )
        const registrar = new CompositionRegistrar<
            Components | NestedComponentInfo,
            Services,
            ComponentMiddlewares
        >(registrarWithNestedComposition as any)

        // We use the mast to limit the API the end user sees, cast back to full compositionRegistrar
        const unmaskedCompositionRegistrar = registerCallback(registrar) as CompositionRegistrar<
            Components | ComponentInformation<'nested-composition', NestedCompositionProps>,
            Services,
            ComponentMiddlewares,
            Exclude<Compositions, never>
        >

        const layout = new LayoutApi(unmaskedCompositionRegistrar)
        const CompositionRenderer = layout.CompositionRenderer
        return layout
    }
}
