import * as Joi from 'joi';
import { Environment } from './types.config';
import { version } from '../../package.json';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(Environment))
    .default(Environment.DEVELOPMENT),
  PORT: Joi.number().port().default(3000),
  HOST: Joi.string().hostname().default('0.0.0.0'),
  PREFIX: Joi.string().default('api'),
  FALLBACK_LANGUAGE: Joi.string().default('en'),

  SWAGGER_TITLE: Joi.string().default('rmis'),
  SWAGGER_DESCRIPTION: Joi.string().default(
    'Rider Medical Information System API description',
  ),
  SWAGGER_VERSION: Joi.string().default(version),

  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().required(),

  ACCESS_TOKEN_NAME: Joi.string()
    .valid('access-token', '__Host-Http-access-token')
    .required(),
  COOKIE_HTTP_ONLY: Joi.boolean().required(),
  COOKIE_PATH: Joi.string().required(),
  COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').required(),
  COOKIE_SECURE: Joi.boolean().required(),
  COOKIE_MAX_AGE: Joi.number().integer().positive().required(),
});
