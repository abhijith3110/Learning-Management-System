import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Swagger Express API',
        version: '1.0.0',
        description: 'API with Swagger documentation',
      },
      servers: [
        {
          url: 'http://localhost:8000', 
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
    apis: ['./routes/v1/*/*.js'], 
  };
  
  export const specs = swaggerJSDoc(options);