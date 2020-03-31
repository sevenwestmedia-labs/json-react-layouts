import { LayoutApi } from './LayoutApi'
import { ComponentProps } from './renderers/component-renderer'

export interface MiddlwareServices<Services> {
    layout: LayoutApi<any, any, any, any>
    services: Services
}

/** The render function for components, converts the route props into a react component */
export type MiddlwareHandler<TProps, TMiddlewareProps extends object, LoadDataServices> = (
    props: TProps,
    middlewareProps: TMiddlewareProps,
    services: MiddlwareServices<LoadDataServices>,
) => React.ReactElement<any> | false | null

export type ComponentRendererMiddleware<Services, ComponentMiddlewareProps extends object> = (
    componentProps: ComponentProps,
    middlewareProps: ComponentMiddlewareProps,
    services: MiddlwareServices<Services>,
    next: MiddlwareHandler<ComponentProps, ComponentMiddlewareProps, Services>,
) => React.ReactElement<any> | false | null

export type CompositionRendererMiddleware<Services, CompositionMiddlewareProps extends object> = (
    compositionProps: {},
    middlewareProps: CompositionMiddlewareProps,
    services: MiddlwareServices<Services>,
    next: MiddlwareHandler<{}, CompositionMiddlewareProps, Services>,
) => React.ReactElement<any> | false | null
