const constructUrl = ({entities, query, search, filter, groupby, cursor}) => {
    const cursor_param = cursor ? `&cursor=${cursor}` : ''
    const search_param = search ? `&search=${search}` : ''
    const filter_param = filter ? `&filter=${filter}` : ''
    const groupby_param = groupby ? `&group_by=${groupby}` : ''
    const query_param = query ? `&${query}` : `${search_param}${filter_param}${groupby_param}`
    const mailto_param = '&mailto=b.van.den.boomen@cwts.leidenuniv.nl'
    const url = `https://api.openalex.org/${entities}?${cursor_param}${query_param}${mailto_param}`;
    return encodeURI(url)
}

// OpenAlexApi generic query
export const OpenAlexApi = async (params={entities: 'works'}) => {
    const url = constructUrl({...params, cursor: null})
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    return url.includes("group_by") ? data.group_by : data.results
}

// OpenAlexApi generic query using cursor pagination
export const OpenAlexApiCursor = async (params) => {
    var cursor = "*";
    var result = [];
    console.log(constructUrl(params));
    while (cursor) {
        const url = constructUrl({...params, cursor})
        console.log(cursor, result.length);
        const response = await fetch(encodeURI(url));
        const data = await response.json();
        result = result.concat(url.includes("group_by") ? data.group_by : data.results)
        cursor = data.meta.next_cursor;
    }
    return result
}
