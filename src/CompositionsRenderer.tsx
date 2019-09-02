import React from 'react'

import { getComponentPath } from './helpers'
import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { LayoutApi } from './LayoutApi'
import { Logger } from 'typescript-log'
import { CompositionRendererProps } from './CompositionRenderer'

export interface Props<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services
> {
    compositions: Compositions[]
    renderPathPrefix?: string
    services: Services
}

export function createCompositionsRenderer<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services,
    ComponentMiddlewaresProps extends object,
    CompositionMiddlewaresProps extends object
>(
    layoutApi: LayoutApi<
        Components,
        Compositions,
        Services,
        ComponentMiddlewaresProps,
        CompositionMiddlewaresProps
    >,
    compositionRegistrar: CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        Compositions,
        CompositionMiddlewaresProps
    >,
    CompositionRenderer: React.FunctionComponent<
        CompositionRendererProps<
            Components,
            Compositions,
            Services,
            ComponentMiddlewaresProps,
            CompositionMiddlewaresProps
        >
    >,
    logger: Logger,
) {
    const CompositionsRenderer: React.FC<
        Props<Components, Compositions & CompositionMiddlewaresProps, Services>
    > = ({ services, renderPathPrefix, compositions }) => {
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
                        <CompositionRenderer
                            key={componentRenderPath}
                            componentRenderPath={componentRenderPath}
                            composition={composition}
                            layoutApi={layoutApi}
                            services={services}
                            renderCompositionMiddleware={compositionRegistrar.componentMiddleware}
                        />
                    )
                })}
            </React.Fragment>
        )
    }
    CompositionsRenderer.displayName = 'CompositionsRenderer'
    return CompositionsRenderer
}
