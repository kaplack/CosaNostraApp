import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

const s3 = new S3Client({ region: env.awsRegion });

const extensionByMimeType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function normalizeS3Error(err, key) {
  if (err?.name === 'AccessDenied' || err?.Code === 'AccessDenied') {
    const normalizedError = new Error(
      `S3 no permite acceder a ${key}. Revisa permisos IAM para ese prefijo.`
    );
    normalizedError.statusCode = 403;
    return normalizedError;
  }

  return err;
}

async function sendS3(command, key) {
  try {
    return await s3.send(command);
  } catch (err) {
    throw normalizeS3Error(err, key);
  }
}

export function isS3Configured() {
  return Boolean(env.awsRegion && env.awsS3Bucket);
}

export function assertValidImage(file) {
  if (!file) {
    const err = new Error('La imagen es requerida');
    err.statusCode = 400;
    throw err;
  }

  if (!extensionByMimeType[file.mimetype]) {
    const err = new Error('Solo se permiten imagenes JPG, PNG o WEBP');
    err.statusCode = 400;
    throw err;
  }
}

export function assertValidTransparentImage(file) {
  if (!file) {
    const err = new Error('La imagen es requerida');
    err.statusCode = 400;
    throw err;
  }

  if (!['image/png', 'image/webp'].includes(file.mimetype)) {
    const err = new Error('Solo se permiten imagenes PNG o WEBP con transparencia');
    err.statusCode = 400;
    throw err;
  }
}

export async function uploadPizzaImage({ pizzaId, file }) {
  assertValidImage(file);

  if (!isS3Configured()) {
    const err = new Error('S3 no esta configurado');
    err.statusCode = 500;
    throw err;
  }

  const extension = extensionByMimeType[file.mimetype];
  const key = `${env.awsS3PizzaPrefix}/${pizzaId}-${randomUUID()}.${extension}`;

  await sendS3(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
    key
  );

  return key;
}

export async function uploadPaymentProof({ orderId, file }) {
  assertValidImage(file);

  if (!isS3Configured()) {
    const err = new Error('S3 no esta configurado');
    err.statusCode = 500;
    throw err;
  }

  const extension = extensionByMimeType[file.mimetype];
  const key = `${env.awsS3PaymentPrefix}/${orderId}-${randomUUID()}.${extension}`;

  await sendS3(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
    key
  );

  return key;
}

export async function uploadPaymentQr({ method, file }) {
  assertValidImage(file);

  if (!isS3Configured()) {
    const err = new Error('S3 no esta configurado');
    err.statusCode = 500;
    throw err;
  }

  const extension = extensionByMimeType[file.mimetype];
  const key = `${env.awsS3PaymentQrPrefix}/${method}-${randomUUID()}.${extension}`;

  await sendS3(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
    key
  );

  return key;
}

export async function uploadIngredientImage({ ingredientId, file }) {
  assertValidTransparentImage(file);

  if (!isS3Configured()) {
    const err = new Error('S3 no esta configurado');
    err.statusCode = 500;
    throw err;
  }

  const extension = extensionByMimeType[file.mimetype];
  const key = `${env.awsS3IngredientPrefix}/${ingredientId}-${randomUUID()}.${extension}`;

  await sendS3(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
    key
  );

  return key;
}

export async function uploadIngredientSelectorImage({ ingredientId, file }) {
  assertValidImage(file);

  if (!isS3Configured()) {
    const err = new Error('S3 no esta configurado');
    err.statusCode = 500;
    throw err;
  }

  const extension = extensionByMimeType[file.mimetype];
  const key = `${env.awsS3IngredientPrefix}/selectors/${ingredientId}-${randomUUID()}.${extension}`;

  await sendS3(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
    key
  );

  return key;
}

export async function deleteObject(key) {
  if (!key || !isS3Configured()) return;

  await sendS3(
    new DeleteObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
    }),
    key
  );
}

export async function getObjectSignedUrl(key) {
  if (!key || !isS3Configured()) return null;

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
    }),
    { expiresIn: env.signedUrlExpiresIn }
  );
}
