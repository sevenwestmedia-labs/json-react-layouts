import React from 'react'

import { RenderFunction, WithRenderKey } from './ComponentRegistrar'
import { CheckedComponentInformation } from './LayoutApi'

export interface CompositionRenderProps<TContentAreas, TProps, TLoadDataServices> {
    contentAreas: { [key in keyof TContentAreas]: React.ReactElement<any> }
    props: TProps

    /** Allows a middleware to be specified for component rendering */
    renderCompositionMiddleware?: (
        props: CompositionRenderProps<TContentAreas, TProps, TLoadDataServices>,
        next: RenderFunction<any, TLoadDataServices>,
    ) => React.ReactElement<any> | false | null
}

export interface CompositionInformation<
    TType extends string,
    TContentAreas extends string,
    TProps extends {}
> extends WithRenderKey {
    type: TType
    props: TProps
    contentAreas: {
        [name in TContentAreas]: CheckedComponentInformation[]
    }
}

export interface CompositionRegistration<
    CompositionType,
    ContentAreas extends string,
    Services,
    CompositionProps extends {}
> {
    type: CompositionType
    render: CompositionRenderFunction<ContentAreas, CompositionProps, Services>
    componentProps:
        | undefined
        | ((options: { contentArea: ContentAreas; props: CompositionProps }) => {})
}

export type CompositionRenderFunction<TContentAreas extends string, TProps, Services> = (
    contentAreas: { [key in TContentAreas]: React.ReactElement<any> },
    renderProps: TProps,
    services: Services,
) => React.ReactElement<any> | false | null

export interface CompositionRegistrations {
    get(type: string): CompositionRegistration<string, any, any, any> | undefined
}
