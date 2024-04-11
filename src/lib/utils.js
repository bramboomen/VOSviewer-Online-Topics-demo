export const reduce_list = (list, key, transform_key=(key => key)) => {
    return (list || []).reduce((collector, item) => {
        collector[transform_key(item[key])] = item;
        return collector;
    }, {});
}

export const tryJSONParse = (json) => {
  try {
      return JSON.parse(json)
  } catch (e) {
      return ({})
  }
}
