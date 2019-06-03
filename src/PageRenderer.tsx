import React from 'react'

import { getRouteDataId } from './helpers'
import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation } from './CompositionRegistrar'
import { RouteBuilder } from './RouteBuilder'

export type Props<
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    TComponents extends ComponentInformation<any>,
    LoadDataServices
> = {
    compositions: TCompositions[]
    renderPathPrefix?: string
    loadDataServices: LoadDataServices
}

export function createPageRenderer<
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    TComponents extends ComponentInformation<any>,
    LoadDataServices
>(
    routeBuilder: RouteBuilder<TCompositions, TComponents, LoadDataServices>,
): React.FC<Props<TCompositions, TComponents, LoadDataServices>> {
    return function PageRenderer({ loadDataServices, renderPathPrefix, compositions }) {
        routeBuilder.compositionRegistrar.componentRegistrar.logger.debug(
            {
                renderPathPrefix,
                compositions: compositions.map(composition => ({
                    type: composition.type,
                })),
            },
            'Rendering page',
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
