import { LayoutApi } from './LayoutApi'
import { ComponentProps } from './renderers/component-renderer'

export interface MiddlwareServices<Services extends {}> {
    layout: LayoutApi<any, any, any, any, Services>
    services: Services
}

/** The render function for components, converts the route props into a react component */
export type MiddlwareHandler<TProps, TMiddlewareProps extends {}, LoadDataServices extends {}> = (
    props: TProps,
    middlewareProps: TMiddlewareProps,
    services: MiddlwareServices<LoadDataServices>,
) => React.ReactElement<any> | false | null

export type RendererMiddleware<Services extends {}, MiddlewareProps extends {}> = (
    props: ComponentProps,
    middlewareProps: MiddlewareProps,
    services: MiddlwareServices<Services>,
    next: MiddlwareHandler<ComponentProps, MiddlewareProps, Services>,
) => React.ReactElement<any> | false | null

export function composeMiddleware<Services extends {}, MiddlewareProps extends {}>(
    componentMiddlewares: Array<RendererMiddleware<Services, MiddlewareProps>>,
): RendererMiddleware<Services, MiddlewareProps> {
    const pipeline = (
        props: ComponentProps,
        middlewareProps: MiddlewareProps,
        services: MiddlwareServices<Services>,
        ...steps: Array<RendererMiddleware<Services, MiddlewareProps>>
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
        return pipeline(props, middlewareProps, services, ...componentMiddlewares, (cp, mp, s) => {
            return next(cp, mp, s)
        })
    }
}
