import 'dotenv/config'

export const jwtConstants = {
    secret: process.env.RSA_PUBLIC_KEY.replace(/\\n/gm, '\n')
}