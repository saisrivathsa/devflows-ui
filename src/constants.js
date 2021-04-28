
const ENVIRONMENT = window.environment || {}


const constants = {
  BACKEND_URL: ENVIRONMENT['APP_BACKEND_URL'] || 'https://backend-devflows-staging.devhub.k8.devfactory.com',
  UI_URL: ENVIRONMENT['APP_UI_URL'] || 'https://devflows-ui-devflows-staging.devhub.k8.devfactory.com',
  ELASTIC_SEARCH_URL: ENVIRONMENT['APP_ELASTIC_SEARCH_URL'] || 'https://vpc-dflows-dev-eks-logs-5pgoaaum3rpzxmqoipx7373rhy.us-east-1.es.amazonaws.com',
  NODES_WIKI_LINK: 'https://github.com/trilogy-group/cn-devflows-backend/wiki/Different-types-of-nodes-in-Devflows',
  AUTH_WIKI_LINK: 'https://github.com/trilogy-group/cn-devflows-backend/wiki/How-to-config-auth',
  FRAMEWORKS: ['Django', 'FastAPI', 'Camel', 'Quarkus', 'Other'],
  INVOCABLE_CONFIG: {
    'FIELDS': {
      'description': {
        'displayName': 'Description',
        'placeholder': 'Description of the invocable',
        "section": "Basic details",
        "required": true
      },
      'input_schema': {
        "section": "Input"
      },
      'input_params': {
        'displayName': 'Input Parameters',
        'placeholder': 'Input fields along with a brief description',
        "section": "Input"
      },
      'input_constraints': {
        'displayName': 'Input Constraints',
        'placeholder': 'eg: S3 bucket name: must exist, must be in a specific format',
        "section": "Input"
      },
      'sample_input': {
        'displayName': 'Sample Input',
        'placeholder': '',
        "section": "Input"
      },
      'output_schema': {
        "section": "Output"
      },
      'output_params': {
        'displayName': 'Output Parameters',
        'placeholder': 'Output fields along with a brief description',
        "section": "Output"
      },
      'sample_output': {
        'displayName': 'Sample Output',
        'placeholder': '',
        "section": "Output"
      },
      'invocable_definition_json': {
        "section": "Config"
      },
      'list_secret': {
        'displayName': 'Secrets Required',
        'placeholder': 'Environment variables which are secrets',
        "section": "Config"
      },
      'get_secret': {
        'displayName': 'Way to get secret token',
        'placeholder': 'Brief description on how the user can obtain the secret values',
        "section": "Config"
      },
      'features': {
        'displayName': 'Use Cases of Invocable',
        'placeholder': 'What problems does the invocable solve for the user?',
        "section": "Basic details"
      },
      'working': {
        'displayName': 'Working of Invocable',
        'placeholder': 'Brief description on how the invocable works and about any specific cases',
        "section": "Basic details"
      },
      'additional_comments': {
        'displayName': 'Additional Comments',
        'placeholder': '',
        "section": "Basic details"
      },
      "versions": {
        "section": "Version"
      }
    },
    'JSON_INPUT_FIELDS': ['invocable_definition_json', 'input_schema', 'output_schema', 'sample_input', 'sample_output'],
    'SECTIONS': ['Basic details', 'Input', 'Output', 'Config', 'Version']
  },
  INITIAL_FLOW: {
    "offset": { "x": 0, "y": 0 },
    "flow_config": {},
    "nodes": {},
    "links": {},
    "selected": {},
    "hovered": {}
  },
  GITHUB_CLIENT_ID: ENVIRONMENT['APP_GITHUB_CLIENT_ID'] || 'feec6a781af25f4f6bdf',
  HTTP_METHOD_OPTIONS: [
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
  ],

  URL_CONFIG_UI_SCHEMA: {
    "permissions": {
      "ui:options":{
        "orderable": false
      }
    }
  },

  URL_CONFIG_SCHEMA: {
    "required": [
      "needs_public_endpoint"
    ],
    "type": "object",
    "properties": {
      "needs_public_endpoint": {
        "type": "boolean",
        "title": "Needs public endpoint",
        "default": false
      }
    },
    "dependencies": {
      "needs_public_endpoint": {
        "oneOf": [
          {
            "properties": {
              "needs_public_endpoint": {
                "enum": [true]
              },
              "permissions": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "title": "Permissions",
                "description": "Note: Permissions will only apply if you have integrated Auth0 with the product and enabled auth for the flow"
              }
            }
          },
          {
            "properties": {
              "needs_public_endpoint": {
                "enum": [false]
              }
            }
          }
        ]
      }
    }
  },

  AUTH0_CONFIG_UI_SCHEMA: {
    "allowed_callback_urls": {
      "ui:options":{
        "orderable": false
      }
    },
    "allowed_web_origins": {
      "ui:options":{
        "orderable": false
      }
    },
    "allowed_logout_urls": {
      "ui:options":{
        "orderable": false
      }
    }
  },

  AUTH0_CONFIG_SCHEMA: {
    "title": "Auth0 Details",
    "description": "https://auth0.com/docs/dashboard/reference/settings-application",
    "type": "object",
    "required": [
      "allowed_callback_urls",
      "allowed_web_origins",
      "allowed_logout_urls",
      "auth0_admin_email"
    ],
    "properties": {
      "allowed_callback_urls": {
        "type": "array",
        "title": "Allowed callback URLs",
        "items": {
          "type": "string"
        }
      },
      "allowed_web_origins": {
        "type": "array",
        "title": "Web Origins",
        "items": {
          "type": "string"
        }
      },
      "allowed_logout_urls": {
        "type": "array",
        "title": "Logout Urls",
        "items": {
          "type": "string"
        }
      },
      "auth0_admin_email": {
        "type": "string",
        "title": "Admin email",
        "format": "email",
        "description": "This admin email will have administrative access to the Auth0 application"
      }
    }
  },

  RUNTIME_CONFIG_SCHEMA: {
    "required": [
      "estimated_runtime_mins",
      "max_retries",
      "concurrency"
    ],
    "type": "object",
    "properties": {
      "estimated_runtime_mins": {
        "type": "number",
        "title": "Estimated Runtime Mins",
        "default": 5,
        "examples": [
          5
        ]
      },
      "max_retries": {
        "type": "number",
        "title": "Max Retries",
        "default": 3,
        "examples": [
          3
        ]
      },
      "concurrency": {
        "type": "number",
        "title": "Concurrency",
        "default": 0,
        "examples": [
          5
        ]
      },
      "resourceRequirements":{
        "type": "object",
        "title": "",
        "properties": {
          "memory": {
            "type": "number",
            "title": "Memory",
            "default": 1,
            "examples": [
              1
            ],
            "description": "Minimum RAM needed for operation"
          },
          "cpu_cores": {
            "type": "number",
            "title": "CPU",
            "default": 1,
            "examples": [
              1
            ],
            "description": "Minimum CPU Cores needed for operation"
          }
        }
      },
      "transformer_expression": {
        "type": "string",
        "title": "Transformer Expression",
        "description": "The JSONata (https://jsonata.org/) transformation to apply to your input payload before sending it to the invocable",
        "default": "",
        "examples": [
          "{ 'context': {'sample': data.example} , 'data': {'message': context.`context-message`} }"
        ]
      },
      "async_task": {
        "type": "boolean",
        "title": "Asynchronous Task",
        "default": false
      },
    },
    "dependencies": {
      "async_task": {
        "oneOf": [
          {
            "properties": {
              "async_task": {
                "enum": [true]
              },
              "request_id_expression": {
                "type": "string",
                "title": "Request ID Expression",
                "description": "A JSONata expression that produces a string representing the ASYNC RequestID. It will be applied to the invocable output (accessible as data.) and output context (accessible as context.)",
                "default": "",
                "examples": [
                  "data.request_id"
                ]
              }
            }
          },
          {
            "properties": {
              "async_task": {
                "enum": [false]
              }
            }
          }
        ]
      }
    }
  },

  RUNTIME_CONFIG_UI_SCHEMA: {
    transformer_expression: {
      "ui:widget": "textarea",
      "ui:options": {
        rows: 3
      },
      "ui:placeholder": '{"context":context, "data":data}',
    },
    request_id_expression: {
      "ui:widget": "textarea",
      "ui:options": {
        rows: 1
      },
      "ui:placeholder": 'data.request_id',
    }
  }
}

export default constants
