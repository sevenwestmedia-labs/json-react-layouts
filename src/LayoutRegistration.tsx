import React from 'react'
import { ComponentRegistrar, ComponentInformation } from './ComponentRegistrar'
import {
    CompositionRegistrar,
    CompositionInformation,
    NestedCompositionProps,
} from './CompositionRegistrar'
import { LayoutApi } from './LayoutApi'
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
    ComponentMiddlewaresProps extends {},
    Services
> {
    constructor(
        private componentRegistrar: ComponentRegistrar<
            Services,
            Components,
            ComponentMiddlewaresProps
        >,
    ) {}

    /** Returns a components renderer component which can render a list of components */
    createComponentsRenderer(): React.FC<{
        components: Array<Components & ComponentMiddlewaresProps>
        services: Services
    }> {
        const layoutApi = this.registerCompositions(registrar => registrar) as any

        interface ComponentsRendererProps {
            components: Array<Components & ComponentMiddlewaresProps>
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
                    ComponentMiddlewaresProps
                >,
                'registerComposition'
            >,
        ) => Pick<
            CompositionRegistrar<
                Components | ComponentInformation<'nested-composition', NestedCompositionProps>,
                Services,
                ComponentMiddlewaresProps,
                Exclude<Compositions, never>
            >,
            'registerComposition'
        >,
    ): LayoutApi<
        Components | NestedComponentInfo,
        Exclude<Compositions, never>,
        Services,
        ComponentMiddlewaresProps
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
                            services={services}
                            layoutApi={layout}
                        />
                    )
                },
            ),
        )
        const registrar = new CompositionRegistrar<
            Components | NestedComponentInfo,
            Services,
            ComponentMiddlewaresProps
        >(registrarWithNestedComposition as any)

        // We use the mast to limit the API the end user sees, cast back to full compositionRegistrar
        const unmaskedCompositionRegistrar = registerCallback(registrar) as CompositionRegistrar<
            Components | ComponentInformation<'nested-composition', NestedCompositionProps>,
            Services,
            ComponentMiddlewaresProps,
            Exclude<Compositions, never>
        >

        const layout = new LayoutApi(unmaskedCompositionRegistrar)
        const CompositionRenderer = layout.CompositionRenderer
        return layout
    }
}
