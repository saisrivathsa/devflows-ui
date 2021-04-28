import constants from '../../../../constants'

export default async function runRequest(body) {
  const host = constants.ELASTIC_SEARCH_URL;

  const response = await fetch(`${host}/invocables-metadata/_search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(response => response.text().then(body => [response, body]))
    .then(([response, body]) => {
      return {
        statusCode: response.status,
        body: JSON.parse(body)
      }
    })
    .catch(() => {
      return {
        statusCode: 500,
        body: "An error occurred"
      }
    });  
    return response.body;
}