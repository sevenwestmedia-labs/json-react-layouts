// import { Logger } from 'typescript-log'

// import { LoadedData } from './DataLoading'
// import { ComponentRegistrar, ComponentInformation } from './ComponentRegistrar'

// // Loads the content area data from the given content area
// function loadContentAreaData<LoadDataServices>(
//     log: Logger,
//     loadDataServices: LoadDataServices,
//     componentRenderPath: string,
//     contentArea: Array<ComponentInformation<any, any>>,
//     componentRegistrar: ComponentRegistrar<LoadDataServices, any>,
// ): Promise<Array<LoadedData<any> | undefined>> {
//     log.debug({ componentRenderPath }, 'Loading content area data')
//     const promises: Array<Promise<LoadedData<any> | undefined>> = []

//     for (const component of contentArea) {
//         // dataDefinition is a hidden runtime property on the registered component
//         // if the component needs data
//         const dataDefinition = componentRegistrar.getDataDefinition(component.type)

//         if (dataDefinition) {
//             const componentRouteDataConfig = (component.props as any).dataDefinition
//             promises.push(
//                 dataDefinition
//                     .loadData(componentRouteDataConfig, loadDataServices)
//                     .then<LoadedData<any>>(data => ({
//                         data: { loaded: true, result: data },
//                     })),
//             )
//         } else {
//             // This can be passed straight through, types will mean
//             // this property won't end up on components which don't have data
//             // but it will exist at runtime as its required to perform the content area index mapping, otherwise
//             // data loaded for [index] and its index wont correlate to the component within the contentArea[index]
//             promises.push(Promise.resolve<LoadedData<any> | undefined>(undefined))
//         }
//     }

//     return Promise.all(promises)
// }
// export interface LoadArguments<LoadDataServices> {
//     location: H.Location
//     componentRenderPath: string
//     contentArea: any[]
//     componentRegistrar: ComponentRegistrar<LoadDataServices, any>
// }

// export function loadContentArea<LoadDataServices, DataLoaderGlobalParams>(
//     params: LoadArguments<LoadDataServices> & DataLoaderGlobalParams,
// ) {
//     return params.routeCache.getOrLoad<Array<LoadedData<any> | undefined>>(
//         params.location,
//         'content-area',
//         params.componentRenderPath,
//         () =>
//             loadContentAreaData(
//                 params.log,
//                 params,
//                 params.componentRenderPath,
//                 params.contentArea,
//                 params.componentRegistrar,
//             ),
//     )
// }

// export const ContentAreaDataLoader = resources.registerResource<
//     Array<LoadedData<any> | undefined>,
//     LoadArguments
// >('content-area', loadContentArea, ['componentRenderPath'])
