import React from 'react'

import { RenderFunction, WithRenderKey, ComponentInformation } from './ComponentRegistrar'
import { ComponentCheckedMessage } from './LayoutRegistration'

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
    TProps = {}
> extends WithRenderKey {
    type: TType
    props: TProps
    contentAreas: {
        [name in TContentAreas]: Array<ComponentInformation<any, any> & ComponentCheckedMessage>
    }
}

export interface CompositionRegistration<
    TType,
    TContentAreas extends string,
    Services,
    TProps = {}
> {
    type: TType
    render: CompositionRenderFunction<TContentAreas, TProps, Services>
}

export type CompositionRenderFunction<TContentAreas extends string, TProps, Services> = (
    contentAreas: { [key in TContentAreas]: React.ReactElement<any> },
    renderProps: TProps,
    services: Services,
) => React.ReactElement<any> | false | null

export interface CompositionRegistrations {
    get(type: string): CompositionRegistration<string, any, any> | undefined
}
