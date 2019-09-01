import { ComponentInformation } from './ComponentRegistrar'
import { NestedCompositionProps, CompositionInformation } from './CompositionRegistrar'

export interface ComponentPathOptions {
    subpath: string
    index?: number
    prefix?: string
}

export function getComponentPath(options: ComponentPathOptions) {
    const { subpath, index, prefix } = options

    const componentPath = index !== undefined ? `[${index}-${subpath}]` : `/${subpath}`
    const prefixPath = prefix ? `${prefix}/` : ''
    const renderPath = `${prefixPath}${componentPath}`

    return renderPath
}
export function isNestedComposition(
    component: ComponentInformation<any, any>,
): component is ComponentInformation<any, NestedCompositionProps> {
    return component.type === 'nested-composition'
}

export function flatMap<T, Mapped>(collection: T[], map: (value: T, i: number) => Mapped[]) {
    return collection.reduce((acc: Mapped[], val: T, i: number) => {
        map(val, i).forEach(v => acc.push(v))
        return acc
    }, [])
}

/** Maps an array of compositions to a flat list of components */
export function getComponentsInCompositions(
    compositions: Array<CompositionInformation<any, any, any, any>>,
    renderPathPrefix: string | undefined,
    renderPath: string | undefined,
) {
    return flatMap(
        compositions,
        (composition: CompositionInformation<any, any, any, any>, i: number) =>
            flatMap(Object.keys(composition.contentAreas), key =>
                contentAreas(composition, i, key, renderPath !== undefined, renderPathPrefix),
            ),
    )
}

/** Takes an array of compositions, and expands any nested compostions
 * into a flat list of components
 */
function expandNestedCompositionsIntoComponents(
    components: Array<ComponentInformation<any, any>>,
    renderPath: string,
    renderPathPrefix: string | undefined,
): ContentAreaData[] {
    const contentAreasArr: ContentAreaData[] = []
    components.forEach((c, i) => {
        if (isNestedComposition(c)) {
            const props = c.props
            const result = getComponentsInCompositions(
                [props.composition],
                renderPathPrefix,
                `${renderPath}[${i}]`,
            )
            result.forEach(col => contentAreasArr.push(col))
        }
    })

    return contentAreasArr
}

// map the content areas from the given composition
function contentAreas(
    composition: CompositionInformation<any, any, any, any>,
    i: number,
    contentAreaKey: string,
    innerSearch: boolean,
    renderPathPrefix: string | undefined,
): ContentAreaData[] {
    const routeDataOptions: ComponentPathOptions = {
        subpath: !innerSearch ? composition.type : 'nested:' + composition.type,
        index: !innerSearch ? i : undefined,
        prefix: renderPathPrefix,
    }

    const components = composition.contentAreas[contentAreaKey]

    const path = `${getComponentPath(routeDataOptions)}/${contentAreaKey}`

    return [
        {
            renderPath: `${path}`,
            contentArea: composition.contentAreas[contentAreaKey],
        },
        ...expandNestedCompositionsIntoComponents(components, path, renderPathPrefix),
    ]
}

export interface ContentAreaData {
    renderPath: string
    contentArea: Array<ComponentInformation<any, any>>
}
