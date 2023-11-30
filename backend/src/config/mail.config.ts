import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailConfig = {
    transport: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      } 
    },
    defaults: {
      from: process.env.SMTP_DEFAULTS_FROM,
    },
    template: {
      dir: join(__dirname, '../../templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    }      
}