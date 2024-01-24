import { Injectable } from '@nestjs/common';
import { Applicant, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as crypto from 'crypto'
import { Observable, catchError, from, map, mergeMap } from 'rxjs';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { SignInDto } from 'src/auth/sign-in.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

@Injectable()
export class ApplicantService {
	constructor(
		private prisma: PrismaService,
		private readonly emailService: MailerService
	) { }

	// Exclude keys from user
	// exclude<Applicant, Key extends keyof Applicant>(applicant: Applicant, keys: Key[]): Omit<Applicant, Key> {
	//   return Object.fromEntries(
	//     Object.entries(applicant).filter(([key]) => !keys.includes("key")
	//   )
	// }

	getOne(select: Prisma.ApplicantSelect, where: Prisma.ApplicantWhereUniqueInput): Promise<Applicant> {
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

	getMany(): Promise<Applicant[]> {
		return this.prisma.applicant.findMany({
				include: { applications: { include: { schoolClass: true } } },
				orderBy: {details: {lastname: 'asc'}}}
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
		const applications = {
			deleteMany: {},
			createMany: { data: data.applications as Prisma.ApplicationCreateManyApplicantInput }
		}
		data = {...data, ...{applications}}

		return this.prisma.applicant.findUnique({where})
		.then(prevApplicant => {
			//Has status from applicant changed from created to applied?
			if(prevApplicant.statusKey === 'created' && data.statusKey === 'applied') {
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

	public confirmEmail(email: string): Observable<any> {
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
}
