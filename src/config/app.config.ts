import { registerAs } from "@nestjs/config";


export default registerAs(
    'app',
    (): Record<string, any> => ({
        name: process.env.APP_NAME || 'data-impulse',
        env: process.env.APP_ENV || 'development',
        http: {
            host: process.env.APP_HOST || 'localhost',
            port: Number.parseInt(process.env.APP_PORT) || 4000,
        }
    })
)