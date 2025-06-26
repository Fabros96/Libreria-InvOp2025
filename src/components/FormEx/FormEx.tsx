import { useFormik } from "formik";
import { Container } from "react-bootstrap";
import * as Yup from "yup";

const validationSchema = Yup.object({
    name: Yup.string().required('El nombre es requerido'),
    email: Yup.string().required('El email es requerido').email('Email inválido'),
    password: Yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('Required'),
})

const FormEx = () => {

    const formik = useFormik({

        //Lo que necesitamos para el formulario
        initialValues: {
            name: '',
            email: '',
            password: '',
        },

        //La validación del formulario
        validationSchema: validationSchema,

        //Lo que pasa cuando se envía el formulario
        //En este caso solo mostramos un alert con los valores del formulario
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    })


    return (
        <Container className="d-flex justify-content-center align-items-center">
            <div className="border rounded-3 p-5 mt-5">
                <h1>Formulario de Ejemplo</h1>
                <h5 className="text-center"> con Formik y Yup</h5>
                <form onSubmit={formik.handleSubmit}>

                    {/* NOMBRE -- DESDE ACA*/}
                    <div className="mb-3 mt-3">
                        <label htmlFor="name" className="form-label">Nombre</label>
                        <input
                            type="text"
                            className='form-control'
                            id="name"
                            name="name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <div className="text-danger">{formik.errors.name}</div>
                        ) : null}
                    </div>
                    {/* HASTA ACA*/}
                    {/* Es para validar un solo elemento*/}

                    
                    {/* EMAIL -- DESDE ACA*/}
                    <div className="mb-3 mt-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className='form-control'
                            id="email"
                            name="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-danger">{formik.errors.email}</div>
                        ) : null}
                    </div>
                    {/* HASTA ACA*/}
                    {/* Es para validar un solo elemento*/}

                    
                    {/* CONTRASEÑA -- DESDE ACA*/}
                    <div className="mb-3 mt-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className='form-control'
                            id="password"
                            name="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-danger">{formik.errors.password}</div>
                        ) : null}
                    </div>
                    {/* HASTA ACA*/}
                    {/* Es para validar un solo elemento*/}


                    <div className="text-end">
                        <button type="submit" className="btn btn-warning px-5">Enviar</button>
                    </div>
                </form>

            </div>
        </Container>
    )
}

export default FormEx