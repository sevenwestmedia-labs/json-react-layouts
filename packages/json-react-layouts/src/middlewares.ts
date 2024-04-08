import { LayoutApi } from './LayoutApi'
import { jrlDebug } from './log'

export interface MiddlwareServices<Services extends {}> {
    layout: LayoutApi<any, any, any, any, Services>
    services: Services
}

export const middlewareDebug = jrlDebug.extend('middleware')

/** The render function for components, converts the route props into a react component */
export type MiddlwareHandler<TProps, TMiddlewareProps extends {}, LoadDataServices extends {}> = (
    props: TProps,
    middlewareProps: TMiddlewareProps,
    services: MiddlwareServices<LoadDataServices>,
) => React.ReactElement<any> | false | null

interface ComponentOrCompositionProps {
    layoutType: string
    [props: string]: any
}

export type RendererMiddleware<Services extends {}, MiddlewareProps extends {}> = (
    props: ComponentOrCompositionProps,
    middlewareProps: MiddlewareProps,
    services: MiddlwareServices<Services>,
    next: MiddlwareHandler<ComponentOrCompositionProps, MiddlewareProps, Services>,
) => React.ReactElement<any> | false | null

export function composeMiddleware<Services extends {}, MiddlewareProps extends {}>(
    componentMiddlewares: Array<RendererMiddleware<Services, MiddlewareProps>>,
): RendererMiddleware<Services, MiddlewareProps> {
    const pipeline = (
        props: ComponentOrCompositionProps,
        middlewareProps: MiddlewareProps,
        services: MiddlwareServices<Services>,
        ...steps: Array<RendererMiddleware<Services, MiddlewareProps>>
    ): React.ReactElement<any> | false | null => {
        const [step, ...next] = steps
        middlewareDebug('Executing', { name: step.name, props, middlewareProps })

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
