import React from 'react'

import { getComponentPath } from './helpers'
import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation } from './CompositionRegistrar'
import { LayoutApi } from './RouteBuilder'
import { Logger } from 'typescript-log'

export type Props<
    TComponents extends ComponentInformation<any>,
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    Services
> = {
    compositions: TCompositions[]
    renderPathPrefix?: string
    services: Services
}

export function createCompositionsRenderer<
    TComponents extends ComponentInformation<any>,
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    Services,
    MiddlewareProps extends {}
>(
    layoutApi: LayoutApi<TComponents, TCompositions, Services, MiddlewareProps>,
    logger: Logger,
): React.FC<Props<TComponents, TCompositions, Services>> {
    return function CompositionsRenderer({ services, renderPathPrefix, compositions }) {
        logger.debug(
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
                    const componentRenderPath = getComponentPath({
                        subpath: composition.type,
                        index,
                        prefix: renderPathPrefix,
                    })

                    return (
                        <layoutApi.CompositionRenderer
                            key={componentRenderPath}
                            componentRenderPath={componentRenderPath}
                            compositionInformation={composition}
                            layoutApi={layoutApi}
                            services={services}
                        />
                    )
                })}
            </React.Fragment>
        )
    }
}
