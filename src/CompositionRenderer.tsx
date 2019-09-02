import React from 'react'
import { ComponentInformation } from './ComponentRegistrar'
import {
    CompositionInformation,
    CompositionRegistrar,
    CompositionRendererProps,
    CompositionRenderProps,
} from './CompositionRegistrar'
import { Logger } from 'typescript-log'
import { LayoutApi } from './LayoutApi'

export function createCompositionRenderer<
    Components extends ComponentInformation<any, any>,
    Compositions extends CompositionInformation<any, Components, any, any>,
    Services,
    ComponentMiddlewaresProps extends object
>(
    layout: LayoutApi<Components, Compositions, Services, ComponentMiddlewaresProps>,
    compositionRegistrar: CompositionRegistrar<
        Components,
        Services,
        ComponentMiddlewaresProps,
        Compositions
    >,
    logger: Logger,
) {
    const CompositionRenderer: React.FunctionComponent<
        CompositionRendererProps<Components, Compositions, Services, ComponentMiddlewaresProps>
    > = (props): React.ReactElement<any> | null => {
        /**
         * The ContentAreaRenderer componentRenderPaths need to append `/[contentArea key]'
         * key as this logic is duped outside of react for the ssr
         */
        logger.debug(
            {
                componentRenderPath: props.componentRenderPath,
                type: props.composition.type,
            },
            'Rendering composition',
        )
        const contentAreas = Object.keys(props.composition.contentAreas).reduce<{
            [key: string]: React.ReactElement<any>
        }>((acc, val) => {
            acc[val] = (
                <layout.ContentAreaRenderer
                    componentRenderPath={`${props.componentRenderPath}/${val}`}
                    contentArea={props.composition.contentAreas[val]}
                    layoutApi={props.layoutApi}
                    services={props.services}
                />
            )
            return acc
        }, {})
        const compositionProps: CompositionRenderProps<any, any, Services> = {
            contentAreas,
            props: props.composition.props,
        }
        const compositionElement = compositionRegistrar.get(props.composition.type)
        return compositionElement(compositionProps)
    }
    CompositionRenderer.displayName = 'CompositionRenderer'
    return CompositionRenderer
}
