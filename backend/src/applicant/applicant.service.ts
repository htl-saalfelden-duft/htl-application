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

@Injectable()
export class ApplicantService {
	constructor(
		private prisma: PrismaService,
		private readonly emailService: MailerService
	) { }

	getOne(where: Prisma.ApplicantWhereUniqueInput): Promise<Applicant> {
		return this.prisma.applicant.findUnique({
			//select,
			where,
			include: { applications: { include: { schoolClass: true } } }
		})
			.then(applicant => {
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
					return this.sendConfirmationMail(data.email)
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

					const passHash = crypto.createHmac('sha512', process.env.HMAC_SECRET).update(signInDto.password).digest('hex')
					if (applicant.passwordHash === passHash) {
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

		return this.getMany(where) // Some function that gets applicants data.
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
			applicants: this.getMany(where),
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
					formatters: {
						string: this.stringOrDateFormatter()
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
		const passHash = crypto.createHmac('sha512', process.env.HMAC_SECRET).update(password).digest('hex')
		applicant.passwordHash = passHash
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
}
