import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode = 200
) {
  const totalPages = Math.ceil(total / limit) || 1;
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
  return res.status(statusCode).json(response);
}
