export const changeParams = (gql: string, params: Object): String => {
  Object.entries(params).forEach(([key, value], index) => {
    gql = gql.replace(`$${key}`, value?.toString())
  })

  return gql
}
