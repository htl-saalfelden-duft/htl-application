import { ApiError, ApiErrorType } from 'src/common/api-error';

export const ACTIVE_STATUS_KEYS = ['registered', 'waiting'];

type Ordered = { id: string, createdAt: Date, statusKey: string };

// Position on the waiting list (1-based), or null if the registration isn't waiting.
// The list is ordered by registration time, see SPEC 4.4.
export const waitingPosition = (registration: Ordered, registrations: Ordered[]): number | null => {
	if (registration.statusKey !== 'waiting') {
		return null
	}
	return registrations
		.filter(r => r.statusKey === 'waiting')
		.sort(compareByCreation)
		.findIndex(r => r.id === registration.id) + 1
}

export const compareByCreation = (a: Ordered, b: Ordered) =>
	a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id)

export const requireText = (...values: unknown[]) => {
	if (values.some(value => typeof value !== 'string' || !value.trim())) {
		throw new ApiError(ApiErrorType.INVALID_INPUT)
	}
}

export const optionalText = (value: unknown): string | null => {
	if (value === undefined || value === null || value === '') {
		return null
	}
	if (typeof value !== 'string') {
		throw new ApiError(ApiErrorType.INVALID_INPUT)
	}
	return value.trim() || null
}
