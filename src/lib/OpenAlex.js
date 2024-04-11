export const parseUrl = (url) => {
    url = url.replace(/^http:\/\//, "https://")
    url = url.replace(/^\//, "https://api.openalex.org/")
    url = url.replace(/^api.openalex.org/, "https://api.openalex.org")
    url = url.replace(/^(works|authors|sources|institutions|topics|publicshers|funders|geo)/, "https://api.openalex.org/$1")
    try {
        const Url = new URL(url)
        return {
            full_url: url,
            base_url: `https://${Url.host}`,
            path:     Url.pathname,
            filter:   Url.searchParams.get('filter'),
            group_by: Url.searchParams.get('group_by'),
            search:   Url.searchParams.get('search'),
            mailto:   Url.searchParams.get('mailto'),
        }
    } catch (_error) {
        return {}
    }
}

export const validateQueryparams = ({base_url, path}) => {
    const valid_urls = ['api.openalex.org', 'https://api.openalex.org', null, undefined]
    const invalid_paths = ['/', '', null, undefined]
    return Boolean(
        valid_urls.includes(base_url)
            &&
        !invalid_paths.includes(path)
    )
}

export const constructUrl = ({path, query, search, filter, group_by, cursor, mailto}) => {
    const cursor_param = cursor ? `&cursor=${cursor}` : ''
    const search_param = search ? `&search=${search}` : ''
    const filter_param = filter ? `&filter=${filter}` : ''
    const group_by_param = group_by ? `&group_by=${group_by}` : ''
    const query_param = query ? `&${query}` : `${search_param}${filter_param}${group_by_param}`
    const mailto_local = localStorage.getItem('mailto')
    const mailto_param = mailto || mailto_local ? `&mailto=${mailto || mailto_local}` : ''
    const url = `https://api.openalex.org${path || ''}?${cursor_param}${query_param}${mailto_param}`;
    return encodeURI(url)
}

// OpenAlexApi generic query
export const OpenAlexApi = async (params) => {
    if (!validateQueryparams(params)) return null
    const url = constructUrl({...params, cursor: null})
    console.log(url);
    try {
        const response = await fetch(url);
        const data = await response.json();
        return url.includes("group_by") ? data.group_by : data.results || data
    } catch {
        return null
    }
}

// OpenAlexApi generic query using cursor pagination
export const OpenAlexApiCursor = async (params) => {
    if (!validateQueryparams(params)) return null
    var cursor = "*";
    var result = [];
    console.log(constructUrl(params));
    while (cursor) {
        const url = constructUrl({...params, cursor})
        console.log(cursor, result.length);
        const response = await fetch(encodeURI(url));
        const data = await response.json();
        result = result.concat(url.includes("group_by") ? data.group_by : data.results || data)
        cursor = data.meta.next_cursor;
    }
    return result
}
