export const flattenPath = (path,  from = "src") => [...path.split(`${from}/`)].pop().replace("/", "-")
