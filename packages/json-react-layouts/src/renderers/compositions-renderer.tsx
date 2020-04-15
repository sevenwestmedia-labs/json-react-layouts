import React from 'react'

import { getComponentPath } from '../helpers'
import { CompositionInformation, CompositionRegistrations } from '../CompositionRegistrar'
import { LayoutApi } from '../LayoutApi'
import { Logger } from 'typescript-log'
import { CompositionRenderer } from './composition-renderer'
import { ComponentRegistrations } from '../ComponentRegistrar'
import { RendererMiddleware } from '../middlewares'

export interface CompositionsRendererProps {
    layoutApi: LayoutApi<any, any, any, any, any>
    compositions: Array<CompositionInformation<any, any, any>>
    componentRegistrations: ComponentRegistrations
    compositionRegistrations: CompositionRegistrations
    componentMiddleware: RendererMiddleware<any, any>
    compositionMiddleware: RendererMiddleware<any, any>
    renderPathPrefix?: string
    services: any
    log: Logger
}

export const CompositionsRenderer: React.FC<CompositionsRendererProps> = ({
    services,
    renderPathPrefix,
    componentRegistrations,
    compositionRegistrations,
    componentMiddleware,
    compositionMiddleware,
    compositions,
    layoutApi,
    log,
}) => {
    log.debug(
        {
            renderPathPrefix,
            compositions: compositions.map((composition) => ({
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
                        key={composition.renderKey || index}
                        componentRenderPath={componentRenderPath}
                        componentRegistrations={componentRegistrations}
                        compositionRegistrations={compositionRegistrations}
                        composition={composition}
                        layoutApi={layoutApi}
                        services={services}
                        log={log}
                        componentMiddleware={componentMiddleware}
                        compositionMiddleware={compositionMiddleware}
                    />
                )
            })}
        </React.Fragment>
    )
}
CompositionsRenderer.displayName = 'CompositionsRenderer'
