import { Injectable } from '@nestjs/common';
import { Prisma, SchoolClass } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { optionalText } from 'src/trial-day/trial-day.utils';

export type SchoolClassDto = Partial<Pick<SchoolClass, 'title' | 'sfkz' | 'location' | 'year' | 'maxPupils' | 'active'>>;

export interface SchoolClassCopyDto {
	ids: string[]
	targetYear: string
	deactivateSource: boolean
}

export interface SchoolClassCopyResult {
	created: number
	skipped: number
	deactivated: number
}

// School year in the form "25/26"
const YEAR_PATTERN = /^\d{2}\/\d{2}$/

@Injectable()
export class SchoolClassService {
	constructor(private prisma: PrismaService) {}

	getMany(where: Prisma.SchoolClassWhereInput): Promise<Partial<SchoolClass>[]> {
		return this.prisma.schoolClass.findMany({
			where,
			orderBy: {title: 'asc'}})
	}

	// Administration overview: all school classes, newest school year first
	getAll(): Promise<SchoolClass[]> {
		return this.prisma.schoolClass.findMany({
			orderBy: [{ year: 'desc' }, { title: 'asc' }]
		})
	}

	async create(dto: SchoolClassDto): Promise<SchoolClass> {
		const data = this.validate(dto)
		await this.assertUnique(data.title, data.year)
		return this.prisma.schoolClass.create({ data })
			.catch(error => {
				throw new ApiError(error)
			})
	}

	async update(id: string, dto: SchoolClassDto): Promise<SchoolClass> {
		const previous = await this.prisma.schoolClass.findUnique({ where: { id } })
		if (!previous) {
			throw new ApiError(ApiErrorType.NOT_FOUND)
		}
		const data = this.validate({ ...previous, ...dto })
		await this.assertUnique(data.title, data.year, id)
		return this.prisma.schoolClass.update({ where: { id }, data })
			.catch(error => {
				throw new ApiError(error)
			})
	}

	// Takes the given school classes over into another school year. Titles that
	// already exist in the target year are skipped.
	async copy(dto: SchoolClassCopyDto): Promise<SchoolClassCopyResult> {
		if (!Array.isArray(dto.ids) || !dto.ids.length || !YEAR_PATTERN.test(dto.targetYear ?? '')) {
			throw new ApiError(ApiErrorType.INVALID_INPUT)
		}

		const sources = await this.prisma.schoolClass.findMany({ where: { id: { in: dto.ids } } })
		const existing = await this.prisma.schoolClass.findMany({
			where: { year: dto.targetYear },
			select: { title: true }
		})
		const existingTitles = new Set(existing.map(schoolClass => schoolClass.title))
		const toCreate = sources.filter(source => source.year !== dto.targetYear && !existingTitles.has(source.title))
		const toDeactivate = dto.deactivateSource ? sources.filter(source => source.year !== dto.targetYear && source.active) : []

		// MongoDB rejects an empty createMany, so both writes run only when needed
		const { created, deactivated } = await this.prisma.$transaction(async tx => ({
			created: toCreate.length ? (await tx.schoolClass.createMany({
				data: toCreate.map(({ title, sfkz, location, maxPupils }) => ({ title, sfkz, location, maxPupils, year: dto.targetYear, active: true }))
			})).count : 0,
			deactivated: toDeactivate.length ? (await tx.schoolClass.updateMany({
				where: { id: { in: toDeactivate.map(source => source.id) } },
				data: { active: false }
			})).count : 0
		}))

		return { created, skipped: sources.length - toCreate.length, deactivated }
	}

	private validate(dto: SchoolClassDto): Prisma.SchoolClassCreateInput {
		const title = dto.title?.trim()
		const sfkz = dto.sfkz?.trim()
		const location = optionalText(dto.location)
		const year = dto.year?.trim()
		const maxPupils = Number(dto.maxPupils)

		if (!title || !sfkz || !YEAR_PATTERN.test(year ?? '') || !Number.isInteger(maxPupils) || maxPupils < 1) {
			throw new ApiError(ApiErrorType.INVALID_INPUT)
		}
		return { title, sfkz, location, year, maxPupils, active: dto.active ?? true }
	}

	private async assertUnique(title: string, year: string, exceptID?: string) {
		const duplicate = await this.prisma.schoolClass.findFirst({
			where: { title, year, ...(exceptID && { id: { not: exceptID } }) }
		})
		if (duplicate) {
			throw new ApiError(ApiErrorType.SCHOOL_CLASS_EXISTS)
		}
	}
}
