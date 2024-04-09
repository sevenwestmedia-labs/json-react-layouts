import { DataDefinition } from './DataLoading'
import { ComponentRegistration } from '../../json-react-layouts/src/ComponentRegistrar'
import { CompositionRegistration } from '../../json-react-layouts/src/CompositionRegistrar'

export type RegistrationWithDataDefinition<
    Type extends string,
    ContentAreas extends string,
    Props extends {},
    Services extends {},
    DataLoadArguments extends {},
    TData,
    AdditionalParams extends {} = {}
> = (
    | ComponentRegistration<Type, Props, Services>
    | CompositionRegistration<Type, ContentAreas, Services, Props>
) & {
    dataDefinition?: DataDefinition<DataLoadArguments, TData, Services, AdditionalParams>
}

export function getDataArgs<
    Type extends string,
    ContentAreas extends string,
    Props extends {},
    Services extends {},
    DataLoadArguments extends {},
    TData,
    AdditionalParams extends {} = {}
>(
    registration:
        | RegistrationWithDataDefinition<
              Type,
              ContentAreas,
              Props,
              Services,
              DataLoadArguments,
              TData,
              AdditionalParams
          >
        | undefined,
): DataDefinition<any, any, Services, any> | undefined {
    return registration?.dataDefinition
}
