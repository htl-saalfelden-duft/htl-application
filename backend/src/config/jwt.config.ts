import 'dotenv/config'
import * as fs from 'fs';

export const jwtConstants = {
    secret: fs.readFileSync(process.env.RSA_PUBLIC_KEY_FILE, 'utf8')
}
