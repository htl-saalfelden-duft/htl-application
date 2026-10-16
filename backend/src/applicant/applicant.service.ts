import { Injectable, NotFoundException } from '@nestjs/common';
import { Applicant, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as crypto from 'crypto'
import { Observable, catchError, forkJoin, from, map, mergeMap } from 'rxjs';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { SignInDto } from 'src/auth/sign-in.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { checkIfFileOrDirectoryExists, createFile, getFile } from 'src/common/storage.helper';
import { AsyncParser } from '@json2csv/node';
import { string as defaultStringFormatter } from '@json2csv/formatters';
import { transformApplicantsDataForBtsCSV, transformApplicantsDataForSokratesCSV } from 'src/common/csv.helper';
import { SettingService } from 'src/setting/setting.service';

export interface ApplicantSelfUpdate {
	details?: Prisma.ApplicantDetailsCreateInput
	contacts?: Prisma.ContactCreateInput[]
	schoolReport?: Prisma.SchoolReportCreateInput
	dsgvo?: boolean
	statusKey?: string
	applications?: { priority: number, schoolClassID?: string }[]
}

@Injectable()
export class ApplicantService {
	constructor(
		private prisma: PrismaService,
		private readonly emailService: MailerService,
		private readonly settingService: SettingService
	) { }

	getOne(where: Prisma.ApplicantWhereUniqueInput): Promise<Applicant> {
		return this.prisma.applicant.findUnique({
			//select,
			where,
			include: {
				applications: { include: { schoolClass: true } },
				trialDayRegistrations: {
					include: { trialDay: { include: { schoolClass: true } } },
					orderBy: { createdAt: 'asc' }
				}
			}
		})
			.then(applicant => {
				if (!applicant) {
					throw new ApiError(ApiErrorType.USER_NOT_FOUND)
				}
				delete applicant.passwordHash
				return applicant
			})
	}

	getMany(where: Prisma.ApplicantWhereInput=undefined): Promise<Applicant[]> {
		return this.prisma.applicant.findMany({
			include: { applications: { include: { schoolClass: true } }},
			orderBy: { details: { lastname: 'asc' } },
			where
		}
		)
			.then(applicants => applicants.map(applicant => {
				delete applicant.passwordHash
				return applicant
			}))
			.catch(error => {
				throw new ApiError(error)
			})
	}

	create(data: Prisma.ApplicantCreateInput) {
		this.setPassword(data, (data as any).password)

		return this.prisma.applicant.create({
			data,
		})
			.catch(error => {
				throw new ApiError(error)
			})

	}

	update(params: { data: Prisma.ApplicantUpdateInput, where: Prisma.ApplicantWhereUniqueInput }): Promise<Applicant> {
		let { data, where } = params;

		// Read-only relation that the form sends back unchanged
		delete (data as any).trialDayRegistrations

		if (data.applications) {
			const applications = {
				deleteMany: {},
				createMany: { data: data.applications as Prisma.ApplicationCreateManyApplicantInput }
			}
			data = { ...data, ...{ applications } }
		}

		return this.prisma.applicant.findUnique({ where })
			.then(prevApplicant => {
				//Has status from applicant changed from created to applied?
				if (prevApplicant.statusKey === 'created' && data.statusKey === 'applied') {
					return this.sendConfirmationMail(prevApplicant.email)
				} else {
					return
				}
			}).then(() => this.prisma.applicant.update({
				where,
				data
			}))
			.catch(error => {
				throw new ApiError(error)
			})
	}

	// Update by the applicant themself: only the form data may be changed, and only
	// as long as the application has not been submitted (created -> applied).
	updateOwn(id: string, dto: ApplicantSelfUpdate): Promise<Applicant> {
		return this.prisma.applicant.findUnique({ where: { id } })
			.then(async prevApplicant => {
				if (!prevApplicant) {
					throw new ApiError(ApiErrorType.USER_NOT_FOUND)
				}
				if (!await this.settingService.isApplicationOpen()) {
					throw new ApiError(ApiErrorType.APPLICATION_CLOSED)
				}
				if (!prevApplicant.emailConfirmed) {
					throw new ApiError(ApiErrorType.EMAIL_NOT_CONFIRMED)
				}
				const statusKey = dto.statusKey ?? prevApplicant.statusKey
				if (prevApplicant.statusKey !== 'created' || !['created', 'applied'].includes(statusKey)) {
					throw new ApiError(ApiErrorType.FORBIDDEN)
				}

				const data: Prisma.ApplicantUpdateInput = {
					details: dto.details,
					contacts: dto.contacts,
					schoolReport: dto.schoolReport,
					dsgvo: dto.dsgvo,
					statusKey
				}
				if (dto.applications) {
					data.applications = dto.applications.map(({ priority, schoolClassID }) => ({
						priority, schoolClassID, statusKey
					})) as any
				}

				return this.update({ where: { id }, data })
			})
	}

	// Account created by the administration without password (SPEC 4.8)
	async setInitialPassword(email: string, password: string, dsgvo: boolean): Promise<void> {
		const applicant = await this.prisma.applicant.findUnique({ where: { email } })
		if (!applicant) {
			throw new ApiError(ApiErrorType.USER_NOT_FOUND)
		}
		if (applicant.passwordHash) {
			throw new ApiError(ApiErrorType.INVITATION_ALREADY_USED)
		}
		if (!applicant.dsgvo && !dsgvo) {
			throw new ApiError(ApiErrorType.DSGVO_REQUIRED)
		}
		if (typeof password !== 'string' || !password) {
			throw new ApiError(ApiErrorType.INVALID_INPUT)
		}

		await this.prisma.applicant.update({
			where: { id: applicant.id },
			data: { passwordHash: hashPassword(password), emailConfirmed: true, dsgvo: true }
		})
	}

	async findById(id: string): Promise<Applicant> {
		const applicant = await this.prisma.applicant.findUnique({ where: { id } })
		if (!applicant) {
			throw new ApiError(ApiErrorType.USER_NOT_FOUND)
		}
		return applicant
	}

	findByEmail(email: string): Promise<Applicant | null> {
		return this.prisma.applicant.findUnique({ where: { email } })
	}

	delete(where: Prisma.ApplicantWhereUniqueInput): Promise<Applicant> {
		return this.prisma.applicant.delete({ where })
			.catch(error => {
				throw new ApiError(error)
			})
	}

	checkCredentials(signInDto: SignInDto): Observable<string> {
		return this.getByEmail(signInDto.email).pipe(
			map((applicant: Applicant) => {
				if (applicant) {
					if (!applicant.active) {
						throw new ApiError(ApiErrorType.USER_NOT_ACTIVE)
					}
					if (!applicant.passwordHash) {
						throw new ApiError(ApiErrorType.PASSWORD_NOT_SET)
					}

					if (applicant.passwordHash === hashPassword(signInDto.password)) {
						delete applicant.passwordHash
						return applicant.id
					} else {
						throw new ApiError(ApiErrorType.WRONG_PASSWORD)
					}
				} else {
					throw new ApiError(ApiErrorType.USER_NOT_FOUND)
				}
			}),
			catchError((error) => {
				throw new ApiError(error)
			})
		)
	}


	exportSokratesCSV(where: Prisma.ApplicantWhereInput=undefined): Promise<string> {
		const filePath = `exports`;
		const fileName = `sokrates-${new Date().toISOString()}.csv`;

		return this.getMany(notAnonymized(where)) // Some function that gets applicants data.
			.then(async (applicants) => {
				const [csvData, csvFields] =
					transformApplicantsDataForSokratesCSV(applicants); // Some function that returns csv data & fields.

				if (!csvData || !csvFields) {
					return Promise.reject("Unable to transform applicants data for CSV.");
				}
				const opts = { 
					fields: csvFields,
					formatters: {
						string: this.stringOrDateFormatter()
					}
				}

				const parser = new AsyncParser(opts)

				return parser.parse(csvData).promise()
			})
			.then(csv => {
				return createFile(filePath, fileName, csv);
			})
			.then(() => Promise.resolve(fileName))
			.catch((error) => Promise.reject(error));
	}

	exportBtsCSV(where: Prisma.ApplicantWhereInput=undefined): Observable<string> {
		const filePath = `exports`;
		const fileName = `bts-${new Date().toISOString()}.csv`;

		return forkJoin({
			applicants: this.getMany(notAnonymized(where)),
			contactTypes: this.prisma.contactType.findMany()
		}).pipe(
			mergeMap(({ applicants, contactTypes }) => {
				const [csvData, csvFields] =
					transformApplicantsDataForBtsCSV(applicants, contactTypes); // Some function that returns csv data & fields.

				if (!csvData || !csvFields) {
					return Promise.reject("Unable to transform applicants data for CSV.");
				}
				const opts = { 
					fields: csvFields,
					delimiter: ';',
					formatters: {
						string: this.stringOrDateFormatterBts()
					}
				}

				const parser = new AsyncParser(opts)

				return parser.parse(csvData).promise()
			}),
			mergeMap(csv => {
				return createFile(filePath, fileName, csv);
			}),
			map(() => fileName),
			catchError((error) => {
				throw new ApiError(error)
			})
		)
	}

	getExportedCSV(filename: string): Promise<string> {
		const filePath = `exports/${filename}`;

		if (!checkIfFileOrDirectoryExists(filePath)) {
			throw new NotFoundException('Applicants export not found.');
		}

		return getFile(filePath, 'utf8')
		.then(res => res.toString())
	}

	confirmEmail(email: string): Observable<any> {
		return from(this.getByEmail(email)).pipe(
			mergeMap(application => {
				if (application.emailConfirmed) {
					throw new ApiError(ApiErrorType.EMAIL_ALREADY_CONFIRMED);
				} else {
					return this.prisma.applicant.update({
						where: { id: application.id },
						data: {
							emailConfirmed: true
						}
					})
				}
			}),
			catchError((error) => {
				throw new ApiError(error)
			})
		)
	}

	private getByEmail(email: string): Observable<Applicant> {
		return from(this.prisma.applicant.findUnique({
			where: { email }
		})).pipe(
			catchError((error) => {
				throw new ApiError(error)
			})
		)
	}

	private sendConfirmationMail(email) {
		return this.emailService.sendMail({
			to: email,
			subject: 'Anmeldung HTBLA Saalfelden',
			template: 'apply-confirmation',
			attachments: [{
				filename: 'mint_guetesiegel.png',
				path: join(__dirname, '../../assets/images/mint_guetesiegel.png'),
				cid: 'ee41a8ed-bbb8-4612-b7f5-064e89621d9f'
			}]
		})
			.catch((err) => {
				console.error(err)
				return
			})
	}

	private setPassword(applicant: Prisma.ApplicantCreateInput, password: string) {
		applicant.passwordHash = hashPassword(password)
		delete (applicant as any).password
		delete (applicant as any).passwordConfirmation

	}

	private isIso8601(value) {
		const iso8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/
		if (value === null || value === undefined) {
			return false
		}
  
		return iso8601.test(value)
	}

	private stringOrDateFormatter = (stringFormatter = defaultStringFormatter()) =>
		(item) =>
			this.isIso8601(item)
			? new Date(item).toLocaleDateString('de-DE')
			: stringFormatter(item);

	private stringOrDateFormatterBts = (stringFormatter = defaultStringFormatter()) =>
		(item) => {
			let output = stringFormatter(item)

			if(this.isIso8601(item)) {
				const date = new Date(item)
				const year = date.getFullYear()
				const month = (date.getMonth() + 1).toString().padStart(2, "0")
				const day = date.getDate().toString().padStart(2, "0")

				output = `${year}-${month}-${day}`
			}

			return output
		}
}

const hashPassword = (password: string) =>
	crypto.createHmac('sha512', process.env.HMAC_SECRET).update(password).digest('hex')

// Anonymized applications (SPEC 4.10) are never exported
const notAnonymized = (where: Prisma.ApplicantWhereInput = {}): Prisma.ApplicantWhereInput =>
	({ AND: [where, { anonymizedAt: { isSet: false } }] })
