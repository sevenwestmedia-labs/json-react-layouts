import { LayoutApi } from 'json-react-layouts'

export type LoadData<DataLoadArguments extends object, TData, Services extends object> = (
    dataDefinitionArgs: DataLoadArguments,
    services: Services,
    context: { resourceType: string; paramsCacheKey: string },
) => Promise<TData>

export interface DataDefinition<
    DataLoadArguments extends object,
    TData,
    Services extends object,
    AdditionalParams extends object = {}
> {
    /** Custom React Hook to provide additional dynamic parameters to the data loader */
    useRuntimeParams?: (
        dataDefinitionArgs: DataLoadArguments,
        services: Services,
    ) => AdditionalParams
    loadData: LoadData<DataLoadArguments & AdditionalParams, TData, Services>
}

export type MaybeLoaded<TData> = { loaded: false } | { loaded: true; result: TData }
export interface ComponentState<TData> {
    data: MaybeLoaded<TData>
}

export interface LoadArguments<Services extends object> {
    dataDefinition: DataDefinition<any, any, Services>
    dataDefinitionArgs: any
    layout: LayoutApi<any, any, any, any, Services>
}
