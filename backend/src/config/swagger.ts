import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MockPrep API",
            version: "1.0.0",
            description:
                "API documentation for the MockPrep backend",
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Local development server",
            },
        ],
    },

    apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
