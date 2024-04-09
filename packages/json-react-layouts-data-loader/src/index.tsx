import React from 'react'
import {
    RendererMiddleware,
    ComponentRegistration,
    RenderFunction,
    MiddlwareHandler,
    MiddlwareServices,
    CompositionRegistration,
    CompositionRenderFunction,
} from 'json-react-layouts'
import { DataLoaderResources } from 'react-ssr-data-loader'

import { ComponentState, LoadArguments, DataDefinition, MaybeLoaded, LoadData } from './DataLoading'
import { getDataArgs } from './get-data-args'

type RenderComponentWithDataProps<
    ComponentProps extends {},
    TData,
    TConfig extends {},
    Services
> = (
    props: ComponentProps,
    dataProps: MaybeLoaded<TData> & {
        dataDefinitionArgs: TConfig
    },
    services: Services,
) => React.ReactElement<any> | false | null

type RenderCompositionWithDataProps<
    TContentAreas extends string,
    ComponentProps extends {},
    TData,
    TConfig extends {},
    Services
> = (
    contentAreas: { [key in TContentAreas]: React.ReactElement<any> },
    props: ComponentProps,
    dataProps: MaybeLoaded<TData> & {
        dataDefinitionArgs: TConfig
    },
    services: Services,
) => React.ReactElement<any> | false | null

// TODO this could have a better name
export function init<Services extends object>(
    resources: DataLoaderResources<Services>,
    /** Hook into data load functions */
    wrapLoad?: (loadData: LoadData<any, any, Services>) => LoadData<any, any, Services>,
): {
    createRegisterableComponentWithData: <
        ComponentType extends string,
        ComponentProps extends object,
        DataLoadArgs extends object,
        ComponentData,
        AdditionalParams extends object
    >(
        type: ComponentType,
        dataDefinition: DataDefinition<DataLoadArgs, ComponentData, Services, AdditionalParams>,
        render: RenderComponentWithDataProps<ComponentProps, ComponentData, DataLoadArgs, Services>,
    ) => ComponentRegistration<
        ComponentType,
        ComponentProps & { dataDefinitionArgs: DataLoadArgs },
        Services
    >
    createRegisterableCompositionWithData: <ContentAreas extends string>() => <
        CompositionType extends string,
        CompositionProps extends object,
        DataLoadArgs extends object,
        CompositionData,
        AdditionalParams extends object
    >(
        type: CompositionType,
        dataDefinition: DataDefinition<DataLoadArgs, CompositionData, Services, AdditionalParams>,
        render: RenderCompositionWithDataProps<
            ContentAreas,
            CompositionProps,
            CompositionData,
            DataLoadArgs,
            Services
        >,
    ) => CompositionRegistration<
        CompositionType,
        ContentAreas,
        Services,
        CompositionProps & { dataDefinitionArgs: DataLoadArgs }
    >
    getMiddleware: (type: 'component' | 'composition') => RendererMiddleware<Services, {}>
} {
    const useComponentData = resources.registerResource<any, LoadArguments<Services>>(
        'component-data-loader',
        ({
            dataDefinitionArgs,
            dataDefinition,
            layout,
            resourceType,
            paramsCacheKey,
            ...services
        }) => {
            const loadFn = wrapLoad ? wrapLoad(dataDefinition.loadData) : dataDefinition.loadData

            return loadFn(dataDefinitionArgs, services as any, {
                resourceType,
                paramsCacheKey,
            })
        },
        ['dataDefinitionArgs'],
    )

    function DataLoaderWithRuntimeParams({
        dataDefinition,
        componentProps,
        services,
        next,
        middlewareProps,
    }: {
        dataDefinition: DataDefinition<any, any, Services, any>
        componentProps: any
        services: MiddlwareServices<Services>
        next: MiddlwareHandler<any, {}, Services>
        middlewareProps: {}
    }) {
        const dataDefinitionArgs = {
            ...componentProps.dataDefinitionArgs,
            ...dataDefinition.useRuntimeParams!(
                componentProps.dataDefinitionArgs,
                services.services,
            ),
        }

        componentProps = { ...componentProps, dataDefinitionArgs }

        const renderProps = useComponentData({
            dataDefinition,
            dataDefinitionArgs,
            layout: services.layout,
        })

        if (!renderProps.lastAction.success) {
            // We have failed to load data, use error boundaries
            // to send error back up and render error page
            throw renderProps.lastAction.error
        }

        const data: ComponentState<any> = renderProps.data.hasData
            ? { data: { loaded: true, result: renderProps.data.result } }
            : { data: { loaded: false } }
        return (
            next(
                {
                    ...componentProps,
                    ...data,
                },
                middlewareProps,
                services,
            ) || null
        )
    }

    function WithDataLoad({
        dataDefinition,
        props,
        services,
        next,
        middlewareProps,
    }: {
        dataDefinition: DataDefinition<any, any, Services, any>
        props: any
        services: MiddlwareServices<Services>
        next: MiddlwareHandler<any, {}, Services>
        middlewareProps: {}
    }) {
        const dataDefinitionArgs = props.dataDefinitionArgs

        const renderProps = useComponentData({
            dataDefinition,
            dataDefinitionArgs,
            layout: services.layout,
        })

        if (!renderProps.lastAction.success) {
            // We have failed to load data, use error boundaries
            // to send error back up and render error page
            throw renderProps.lastAction.error
        }

        const data: ComponentState<any> = renderProps.data.hasData
            ? { data: { loaded: true, result: renderProps.data.result } }
            : { data: { loaded: false } }
        return (
            next(
                {
                    ...props,
                    ...data,
                },
                middlewareProps,
                services,
            ) || null
        )
    }

    return {
        createRegisterableComponentWithData: function createRegisterableComponentWithData<
            ComponentType extends string,
            ComponentProps extends {},
            DataLoadArgs extends {},
            ComponentData,
            AdditionalParams extends object
        >(
            type: ComponentType,
            dataDefinition: DataDefinition<DataLoadArgs, ComponentData, Services, AdditionalParams>,
            render: RenderComponentWithDataProps<
                ComponentProps,
                ComponentData,
                DataLoadArgs,
                Services
            >,
        ) {
            // This is quite a complex transform which can't be modelled in typescript.
            //
            // The dataDefinition which is passed to this object is hidden from the types returned
            // The content area renderer has a data loader which will look for this property
            // Then use the loadData function
            const normalRender: RenderFunction<
                ComponentProps &
                    ComponentState<ComponentData> & {
                        dataDefinitionArgs: DataLoadArgs & AdditionalParams
                    },
                Services
            > = ({ data, dataDefinitionArgs, ...rest }, services) => {
                return render(
                    rest as any,
                    {
                        ...data,
                        dataDefinitionArgs,
                    },
                    services,
                )
            }

            const registrationWithData: any = { type, render: normalRender, dataDefinition }
            // Once the data is loaded it will be passed to the render function on the
            // data prop, which will be typed as LoadedData<TData>

            // The route info looks like this:
            // { type: TType, props: TProps & { dataDefinition: TData } }
            return registrationWithData
        },
        createRegisterableCompositionWithData: <TContentAreas extends string>() => <
            CompositionType extends string,
            CompositionProps extends {},
            DataLoadArgs extends {},
            CompositionData,
            AdditionalParams extends object
        >(
            type: CompositionType,
            dataDefinition: DataDefinition<
                DataLoadArgs,
                CompositionData,
                Services,
                AdditionalParams
            >,
            render: RenderCompositionWithDataProps<
                TContentAreas,
                CompositionProps,
                CompositionData,
                DataLoadArgs,
                Services
            >,
        ) => {
            // This is quite a complex transform which can't be modelled in typescript.
            //
            // The dataDefinition which is passed to this object is hidden from the types returned
            // The content area renderer has a data loader which will look for this property
            // Then use the loadData function
            const normalRender: CompositionRenderFunction<
                TContentAreas,
                CompositionProps &
                    ComponentState<CompositionData> & {
                        dataDefinitionArgs: DataLoadArgs & AdditionalParams
                    },
                Services
            > = (contentAreas, { data, dataDefinitionArgs, ...rest }, services) => {
                return render(
                    contentAreas,
                    rest as any,
                    {
                        ...data,
                        dataDefinitionArgs,
                    },
                    services,
                )
            }

            const registrationWithData: any = { type, render: normalRender, dataDefinition }
            // Once the data is loaded it will be passed to the render function on the
            // data prop, which will be typed as LoadedData<TData>

            // The route info looks like this:
            // { type: TType, props: TProps & { dataDefinition: TData } }
            return registrationWithData
        },
        getMiddleware: type => (props, middlewareProps, services, next) => {
            const registration =
                type === 'component'
                    ? services.layout.componentRegistrations.get(props.layoutType)
                    : services.layout.compositionRegistrations.get(props.layoutType)

            // No registration found for this component.
            if (!registration) {
                return next(props, middlewareProps, services)
            }

            const dataDefinition = getDataArgs(registration)

            // dataDefinition does not exist on all components.
            if (!dataDefinition) {
                return next(props, middlewareProps, services)
            }

            if (dataDefinition.useRuntimeParams) {
                return (
                    <DataLoaderWithRuntimeParams
                        dataDefinition={dataDefinition}
                        componentProps={props}
                        services={services}
                        next={next}
                        middlewareProps={middlewareProps}
                    />
                )
            } else {
                return (
                    <WithDataLoad
                        dataDefinition={dataDefinition}
                        props={props}
                        services={services}
                        next={next}
                        middlewareProps={middlewareProps}
                    />
                )
            }
        },
    }
}

export { DataDefinition, MaybeLoaded, getDataArgs as getComponentDataArgs }
