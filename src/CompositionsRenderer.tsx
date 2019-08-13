import React from 'react'

import { getRouteDataId } from './helpers'
import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation } from './CompositionRegistrar'
import { RouteBuilder } from './RouteBuilder'

export type Props<
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    TComponents extends ComponentInformation<any> & MiddlwareProps,
    LoadDataServices,
    MiddlwareProps extends {}
> = {
    compositions: TCompositions[]
    renderPathPrefix?: string
    loadDataServices: LoadDataServices
}

export function createCompositionsRenderer<
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    TComponents extends ComponentInformation<any> & MiddlewareProps,
    LoadDataServices,
    MiddlewareProps extends {}
>(
    routeBuilder: RouteBuilder<TCompositions, TComponents, LoadDataServices, MiddlewareProps>,
): React.FC<Props<TCompositions, TComponents, LoadDataServices, MiddlewareProps>> {
    return function CompositionsRenderer({ loadDataServices, renderPathPrefix, compositions }) {
        routeBuilder.compositionRegistrar.componentRegistrar.logger.debug(
            {
                renderPathPrefix,
                compositions: compositions.map(composition => ({
                    type: composition.type,
                })),
            },
            'Rendering compositions',
        )

        return (
            <React.Fragment>
                {compositions.map((composition, index) => {
                    const componentRenderPath = getRouteDataId({
                        path: location.pathname,
                        subpath: composition.type,
                        index,
                        prefix: renderPathPrefix,
                    })
                    return (
                        <routeBuilder.compositionRegistrar.CompositionRenderer
                            key={componentRenderPath}
                            componentRenderPath={componentRenderPath}
                            compositionInformation={composition}
                            routeBuilder={routeBuilder}
                            loadDataServices={loadDataServices}
                        />
                    )
                })}
            </React.Fragment>
        )
    }
}
