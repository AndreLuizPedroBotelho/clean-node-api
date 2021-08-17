export const notFound = {
  description: 'Api não encontrado',
  content: {
    'application/json': {
      schema: {
        $ref: '#/schemas/error'
      }
    }
  }
}
