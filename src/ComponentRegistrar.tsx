import React from 'react'
import { RendererMiddleware } from '.'

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

/** Initial component registration builder */
export interface ComponentRegistrationBuilderStart<Services extends {}> {
    registerComponent<TType extends string, TProps extends {}>(
        registration: ComponentRegistration<TType, TProps, Services>,
    ): ComponentRegistrationBuilder<Services, ComponentInformation<TType, TProps>, {}>
}

/** Component registration builder */
export interface ComponentRegistrationBuilder<
    Services extends {},
    Components extends ComponentInformation<any>,
    ComponentMiddlewaresProps extends {}
> {
    registerComponent<TType extends string, TProps extends {}>(
        registration: ComponentRegistration<TType, TProps, Services>,
    ): ComponentRegistrationBuilder<
        Services,
        Components | ComponentInformation<TType, TProps>,
        ComponentMiddlewaresProps
    >

    registerMiddleware<TRegistrationMiddlewareProps extends {}>(
        componentMiddleware: RendererMiddleware<Services, TRegistrationMiddlewareProps>,
    ): ComponentRegistrationBuilder<
        Services,
        Components,
        ComponentMiddlewaresProps & TRegistrationMiddlewareProps
    >
}

export interface ComponentRegistrations {
    isRegistered(type: string): boolean

    /**
     * expects the type from T to be passed in as a parameter, from this we
     * can retrieve the render function associated with the component
     */
    get(type: string): ComponentRegistration<string, any, any> | undefined
}
