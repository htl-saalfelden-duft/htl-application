import { Button, Card, CardBody, Form, Row } from "react-bootstrap"
import { useForm, Controller } from "react-hook-form"
import AsyncSelect from 'react-select/async'

interface IFormInput {
	firstname: string
    moreFirstname: string
    lastname: string
	birthdate: string
	svnr: string
	svInstitution: string
	countryOfBirth: string  //Country
	placeOfBirth: string		
	nationality: string     //Country
	language: string        //Language
	sex: string             //Sex
	religion: string        //Religion
	schoolAge: string
	schoolHome: string
	previousSchoolTxt: string
	previousSchoolNum: string
	previousSchoolAddress: string
	secondChoiceSchool: string
	annotation: string
}

const Home = () => {
    const { 
		register, 
		handleSubmit,
        control,
		formState: { errors }
	} = useForm<IFormInput>()

    const onSubmit = handleSubmit((data) => {
        console.log(data)
    })

    const filterColors = (inputValue: string) => {
        return [{label: "Kasachstan"}, {label: "Uspekistan"}].filter((i) =>
          i.label.toLowerCase().includes(inputValue.toLowerCase())
        );
      };
      
      const promiseOptions = (inputValue: string) =>
        new Promise<any[]>((resolve) => {
          setTimeout(() => {
            resolve(filterColors(inputValue));
          }, 1000);
        });

    return (
        <Card className='col-lg-10 mt-5 w-100'>
            <CardBody>
                <Form onSubmit={onSubmit}>
                    <Row>
                        <Form.Group className="mb-3 col">
                            <Form.Label htmlFor="firstname">
                                Vorname
                            </Form.Label>
                            <Form.Control
                                type="firstname"
                                {...register("firstname", { required: "Bitte Vorname eingeben", maxLength: 20 })}
                                id="firstname"
                            />
                            {errors.firstname && (
                                <Form.Text className="text-danger">
                                {errors.firstname.message}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3 col">
                            <Form.Label htmlFor="moreFirstname">
                            Weitere Vornamen
                            </Form.Label>
                            <Form.Control
                                type="moreFirstname"
                                {...register("moreFirstname")}
                                id="moreFirstname"
                            />
                            {errors.moreFirstname && (
                                <Form.Text className="text-danger">
                                {errors.moreFirstname.message}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group className="mb-3 col-lg-6">
                            <Form.Label htmlFor="lastname">
                                Nachname
                            </Form.Label>
                            <Form.Control
                                type="lastname"
                                {...register("lastname", { required: "Bitte Nachname eingeben", maxLength: 20 })}
                                id="lastname"
                            />
                            {errors.lastname && (
                                <Form.Text className="text-danger">
                                {errors.lastname.message}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group className="mb-3 col-lg">
                            <Form.Label htmlFor="birthdate">
                                Geburtsdatum
                            </Form.Label>
                            <Form.Control
                                type="birthdate"
                                {...register("birthdate", { required: "Bitte Geburtsdatum eingeben", maxLength: 20 })}
                                id="birthdate"
                            />
                            {errors.birthdate && (
                                <Form.Text className="text-danger">
                                {errors.birthdate.message}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3 col-lg">
                            <Form.Label htmlFor="svnr">
                                SVN
                            </Form.Label>
                            <Form.Control
                                type="svnr"
                                {...register("svnr", { required: "Bitte SVN eingeben", maxLength: 20 })}
                                id="svnr"
                            />
                            {errors.svnr && (
                                <Form.Text className="text-danger">
                                {errors.svnr.message}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3 col-lg">
                            <Form.Label htmlFor="svInstitution">
                                Sozialversicherungs-Anstalt
                            </Form.Label>
                            <Form.Control
                                type="svInstitution"
                                {...register("svInstitution", { required: "Bitte Sozialversicherungs-Anstalt eingeben", maxLength: 20 })}
                                id="svInstitution"
                            />
                            {errors.svInstitution && (
                                <Form.Text className="text-danger">
                                {errors.svInstitution.message}
                                </Form.Text>
                            )}
                        </Form.Group>                                                                
                    </Row>
                    <Row>
                        <Form.Group className="mb-3 col-lg">
                            <Form.Label htmlFor="countryOfBirth">
                                Geburtsland
                            </Form.Label>
                            <Controller
                                control={control}
                                name="countryOfBirth"
                                rules={{
                                    required: "Bitte Geburtsland eingeben",
                                    maxLength: 20
                                }}
                                render={({ field }) => ( //onChange, value, name, ref
                                    <AsyncSelect
                                        ref={field.ref}
                                        //classNamePrefix="addl-class"
                                        loadOptions={promiseOptions}
                                        defaultOptions
                                        onChange={val => field.onChange(val?.label)}
                                    />
                                )}
                            />                            
                            {errors.countryOfBirth && (
                                <Form.Text className="text-danger">
                                {errors.countryOfBirth.message}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3 col-lg">
                            <Form.Label htmlFor="placeOfBirth">
                                Geburtsort
                            </Form.Label>
                            <Form.Control
                                type="placeOfBirth"
                                {...register("placeOfBirth", { required: "Bitte Geburtsort eingeben", maxLength: 20 })}
                                id="placeOfBirth"
                            />
                            {errors.placeOfBirth && (
                                <Form.Text className="text-danger">
                                {errors.placeOfBirth.message}
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3 col-lg">
                            <Form.Label htmlFor="nationality">
                                Nationalität
                            </Form.Label>
                            <Controller
                                control={control}
                                name="nationality"
                                rules={{
                                    required: "Bitte Nationalität eingeben",
                                    maxLength: 20
                                }}
                                render={({ field }) => ( //onChange, value, name, ref
                                    <AsyncSelect
                                        ref={field.ref}
                                        //classNamePrefix="addl-class"
                                        loadOptions={promiseOptions}
                                        defaultOptions
                                        onChange={val => field.onChange(val?.label)}
                                    />
                                )}
                            />                            
                            {errors.nationality && (
                                <Form.Text className="text-danger">
                                {errors.nationality.message}
                                </Form.Text>
                            )}
                        </Form.Group>                                                                                    
                    </Row>
                    <Button variant="primary" type="submit">Submit</Button>                                         
                </Form>
            </CardBody>
        </Card>
    )
}

export default Home