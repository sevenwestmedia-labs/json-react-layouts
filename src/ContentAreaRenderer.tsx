import React from 'react'
import { Logger } from 'typescript-log'

import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { ComponentInformation } from './ComponentRegistrar'
import { ComponentRenderer } from './ComponentRenderer'
import { LayoutApi } from './LayoutApi'

export interface ContentAreaRendererProps<
    Components extends ComponentInformation<any>,
    Compositions extends CompositionInformation<any, any, any>,
    Services
> {
    componentRenderPath: string
    contentArea: Components[]
    layoutApi: LayoutApi<Components, Compositions, Services, any, any>
    services: Services
}

export function createContentAreaRenderer<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services,
    ComponentMiddlewaresProps extends object,
    CompositionsMiddlewaresProps extends object
>(
    compositionRegistrar: CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        Compositions,
        CompositionsMiddlewaresProps
    >,
    logger: Logger,
) {
    const ContentAreaRenderer: React.FC<
        ContentAreaRendererProps<Components, Compositions, Services>
    > = (props): React.ReactElement<any> => {
        logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                components: props.contentArea.map(component => ({
                    type: component.type,
                })),
            },
            'Rendering content area',
        )

        return (
            <React.Fragment>
                {props.contentArea.map((item, index) => {
                    const { type, props: componentProps, ...middlewareProps } = item
                    return (
                        <ComponentRenderer
                            // TODO allow components to be re-orderered without remounting
                            key={`${item.type}-${index}`}
                            type={type}
                            layoutApi={props.layoutApi}
                            componentRegistrar={compositionRegistrar.componentRegistrar}
                            componentProps={{
                                ...componentProps,
                                componentType: item.type,
                                componentRenderPath: `${props.componentRenderPath}[${index}]`,
                            }}
                            middlewareProps={middlewareProps}
                            services={props.services}
                            renderComponentMiddleware={
                                compositionRegistrar.componentRegistrar.componentMiddleware
                            }
                        />
                    )
                })}
            </React.Fragment>
        )
    }
    ContentAreaRenderer.displayName = 'ContentAreaRenderer'
    return ContentAreaRenderer
}
