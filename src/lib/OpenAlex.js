// OpenAlexApi generic query
export const OpenAlexApi = async (entities="works", query="") => {
    const url = `https://api.openalex.org/${entities}?${query}`;
    const response = await fetch(encodeURI(url));
    const data = await response.json();
    console.log(url);
    return query.includes("group_by") ? data.group_by : data.results
}

// OpenAlexApi generic query using cursor pagination
export const OpenAlexApiCursor = async (entities="works", query="") => {
    var cursor = "*";
    var result = [];
    while (cursor) {
        const url = `https://api.openalex.org/${entities}?cursor=${cursor}&${query}`;
        console.log(cursor, result.length);
        const response = await fetch(encodeURI(url));
        const data = await response.json();
        result = result.concat(query.includes("group_by") ? data.group_by : data.results)
        cursor = data.meta.next_cursor;
    }
    return result
}
