import { OpenAPIV2, OpenAPIV3 } from "openapi-types";


export class CreateSwagger {
  static load(basePath: string): OpenAPIV3.Document {

    return {
      "openapi": "3.0.0",
      "info": {
        "version": "0.1.0",
        "title": "ENTSO-E JSON API",
        "description": "Simplified ENTSO-E JSON API. Cached year, month, week, day requests for speedup",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
          "name": "Bernhard Zwischenbrugger",
        },
        "license": {
          "name": "Apache 2.0",
          "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
        }
      },
      "paths": {
        [`${basePath}/datalists/countries`]: {
          "get": {
            "tags": [
              "Datalists"
            ],
            "description": "",
            "operationId": "getCountries",
            "parameters": [
            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Country"
                      }
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/datalists/psrtypes`]: {
          "get": {
            "tags": [
              "Datalists"
            ],
            "description": "https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html#_psrtype",
            "operationId": "getPsrTypes",
            "parameters": [
            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/PsrType"
                      }
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/{country}/cached/installed`]: {
          "get": {
            "description": "",
            "operationId": "getInstalled",
            "tags": [
              "ENTSO-E Charts cached"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": true,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "year",
                "in": "query",
                "description": "year",
                "required": true,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "2020"
              },
            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Installed"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/{country}/cached/generation`]: {
          "get": {
            "description": "",
            "operationId": "getGeneration",
            "tags": [
              "ENTSO-E Charts cached"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "year",
                "in": "query",
                "description": "year",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "2020"
              },
              {
                "name": "month",
                "in": "query",
                "description": "Month",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "3"
              },
              {
                "name": "week",
                "in": "query",
                "description": "Week",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                }
              },
              {
                "name": "day",
                "in": "query",
                "description": "day",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "20"
              },




            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/{country}/cached/prices`]: {
          "get": {
            "description": "",
            "operationId": "getCachedPrices",
            "tags": [
              "ENTSO-E Charts cached"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "year",
                "in": "query",
                "description": "year",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "2020"
              },
              {
                "name": "month",
                "in": "query",
                "description": "Month",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "3"
              },
              {
                "name": "week",
                "in": "query",
                "description": "Week",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                }
              },
              {
                "name": "day",
                "in": "query",
                "description": "day",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "20"
              },




            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/{country}/cached/hydrofill`]: {
          "get": {
            "description": "",
            "operationId": "getCachedHydrofill",
            "tags": [
              "ENTSO-E Charts cached"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "year",
                "in": "query",
                "description": "year",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "2020"
              },
              {
                "name": "month",
                "in": "query",
                "description": "Month",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "3"
              },
              {
                "name": "week",
                "in": "query",
                "description": "Week",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                }
              },
              {
                "name": "day",
                "in": "query",
                "description": "day",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                }
              },




            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
       [`${basePath}/{country}/cached/load`]: {
          "get": {
            "description": "",
            "operationId": "getCachedLoad",
            "tags": [
              "ENTSO-E Charts cached"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "year",
                "in": "query",
                "description": "year",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "2020"
              },
              {
                "name": "month",
                "in": "query",
                "description": "Month",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "3"
              },
              {
                "name": "week",
                "in": "query",
                "description": "Week",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                }
              },
              {
                "name": "day",
                "in": "query",
                "description": "day",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "20"
              },




            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
 
        [`${basePath}/{country}/cached/prices`]: {
          "get": {
            "description": "",
            "operationId": "getCachedPrices",
            "tags": [
              "ENTSO-E Charts cached"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "year",
                "in": "query",
                "description": "year",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "2020"
              },
              {
                "name": "month",
                "in": "query",
                "description": "Month",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "3"
              },
              {
                "name": "week",
                "in": "query",
                "description": "Week",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                }
              },
              {
                "name": "day",
                "in": "query",
                "description": "day",
                "required": false,
                "schema": {
                  "type": "string",
                  "format": "year"
                },
                "example": "20"
              },




            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },


        [`${basePath}/{country}/installed`]: {
          "get": {
            "description": "",
            "operationId": "getInstalled",
            "tags": [
              "ENTSO-E Charts direct"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": true,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "periodStart",
                "in": "query",
                "description": "start",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201610012300"
              },
              {
                "name": "periodEnd",
                "in": "query",
                "description": "end",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611012300"
              }
            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/InstalledGeneration"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/{country}/generation`]: {
          "get": {
            "description": "",
            "operationId": "getGeneration",
            "tags": [
              "ENTSO-E Charts direct"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "periodStart",
                "in": "query",
                "description": "start",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611012300"
              },
              {
                "name": "periodEnd",
                "in": "query",
                "description": "end",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611022300"
              }, {
                "name": "psrType",
                "in": "query",
                "description": "psrType, let empty for all generation types",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "B16"
              }

            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        [`${basePath}/{country}/prices`]: {
          "get": {
            "description": "",
            "operationId": "getPrices",
            "tags": [
              "ENTSO-E Charts direct"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "periodStart",
                "in": "query",
                "description": "start",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611012300"
              },
              {
                "name": "periodEnd",
                "in": "query",
                "description": "end",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611022300"
              }

            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },

        [`${basePath}/{country}/hydrofill`]: {
          "get": {
            "description": "",
            "operationId": "getHydrofill",
            "tags": [
              "ENTSO-E Charts direct"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "periodStart",
                "in": "query",
                "description": "start",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201601010000"
              },
              {
                "name": "periodEnd",
                "in": "query",
                "description": "end",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201612312300"
              }

            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },

        [`${basePath}/{country}/load`]: {
          "get": {
            "description": "",
            "operationId": "getLoad",
            "tags": [
              "ENTSO-E Charts direct"
            ],
            "parameters": [
              {
                "name": "country",
                "in": "path",
                "description": "country code",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "10YAT-APG------L"
              },
              {
                "name": "periodStart",
                "in": "query",
                "description": "start",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611012300"
              },
              {
                "name": "periodEnd",
                "in": "query",
                "description": "end",
                "required": false,
                "schema": {
                  "type": "string",
                },
                "example": "201611022300"
              }

            ],
            "responses": {
              "200": {
                "description": "installed generation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/ChartGroup"
                    }
                  }
                }
              },
              "default": {
                "description": "input error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
      },




      "components": {
        "schemas": {
          "ChartGroup": {
            "allOf": [

              {
                "$ref": "#/components/schemas/Metadata"
              },
              {
                "type": "object",
                "properties": {
                  "year": {
                    "type": "string",
                    "format": "year"
                  },
                  "chartData": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Chart"
                    }
                  }
                }
              }
            ]
          },
          "Chart": {
            "type": "object",
            "properties": {
              "label": {
                "type": "string"
              },
              "psrType": {
                "type": "string"
              },
              "data": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Point"
                }
              },
            }
          },
          "Point": {
            "type": "object",
            "properties": {
              "x": {
                "type": "number"
              },
              "y": {
                "type": "number"
              }
            }
          },






          "Metadata": {
            "allOf": [
              {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string"
                  },
                  "countryCode": {
                    "type": "string"
                  },
                  "unit": {
                    "type": "string"
                  },
                  "source": {
                    "type": "string"
                  },
                }
              }
            ]
          },


          "InstalledGeneration": {
            "allOf": [
              {
                "$ref": "#/components/schemas/Metadata"
              },
              {
                "type": "object",
                "properties": {
                  "year": {
                    "type": "string",
                    "format": "year"
                  },
                  "data": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/InstalledGenerationType"
                    }
                  }
                }
              }
            ]
          },
          "InstalledGenerationType": {
            "type": "object",
            "properties": {
              "prsType": {
                "type": "string"
              },
              "value": {
                "type": "integer"
              },
              "label": {
                "type": "string"
              }
            }
          },
          "Country": {
            "type": "object",
            "properties": {
              "code": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          },
          "PsrType": {
            "type": "object",
            "properties": {
              "code": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          },


          "Error": {
            "type": "object",
            "required": [
              "code",
              "message"
            ],
            "properties": {
              "code": {
                "type": "string",
              },
              "message": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}