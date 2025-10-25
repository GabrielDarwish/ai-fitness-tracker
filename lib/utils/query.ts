/**
 * Query Utilities
 * Helper functions for building database queries
 */

/**
 * Build Filter Object for Prisma
 * Creates a Prisma where clause from search parameters
 */
export function buildExerciseFilters(searchParams: URLSearchParams): {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  name?: { contains: string; mode: "insensitive" };
} {
  const filters: ReturnType<typeof buildExerciseFilters> = {};

  const bodyPart = searchParams.get("bodyPart");
  if (bodyPart) filters.bodyPart = bodyPart;

  const equipment = searchParams.get("equipment");
  if (equipment) filters.equipment = equipment;

  const target = searchParams.get("target");
  if (target) filters.target = target;

  const search = searchParams.get("search");
  if (search) {
    filters.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  return filters;
}

/**
 * Build Date Range Filter
 */
export function buildDateRangeFilter(
  startDate?: string,
  endDate?: string
): { gte?: Date; lte?: Date } | undefined {
  if (!startDate && !endDate) return undefined;

  const filter: { gte?: Date; lte?: Date } = {};

  if (startDate) {
    filter.gte = new Date(startDate);
  }

  if (endDate) {
    filter.lte = new Date(endDate);
  }

  return filter;
}

/**
 * Calculate Pagination Info
 */
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}

export function calculatePagination(
  total: number,
  limit: number,
  offset: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const hasMore = offset + limit < total;

  return {
    total,
    limit,
    offset,
    hasMore,
    totalPages,
    currentPage,
  };
}

