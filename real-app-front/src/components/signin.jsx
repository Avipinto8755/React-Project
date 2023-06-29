import Input from "./common/input";
import PageHeader from "./common/pageHeader";
import { useFormik } from "formik";
import Joi from "joi";
import { useState } from "react";
import { useAuth } from "../context/authcontext";
import { Navigate, useNavigate } from "react-router-dom";

const SignIn = ({ redirect = "/" }) => {
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const form = useFormik({
    validateOnMount: true,
    initialValues: {
      email: "",
      password: "",
    },
    validate(values) {
      const schema = Joi.object({
        email: Joi.string()
          .min(6)
          .max(255)
          .required()
          .email({ tlds: { allow: false } }),
        password: Joi.string()
          .min(8)
          .max(25)
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "password"
          )
          .required(),
      });

      const { error } = schema.validate(values, { abortEarly: false });
      if (!error) {
        return null;
      }
      const errors = {};
      for (const detail of error.details) {
        const errorKey = detail.path[0];
        errors[errorKey] = detail.message;
      }
      return errors;
    },
    async onSubmit(values) {
      try {
        await login(values);
        navigate(redirect);
      } catch ({ response }) {
        if (response && response.status === 400) {
          setError(response.data);
        }
      }
    },
  });

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="row ">
        <div className="col-sm-3"></div>
        <div className="border border-3 mt-5 rounded col-sm-6 ">
          <PageHeader title="Sign In" description="sign in to your accound" />
          <form onSubmit={form.handleSubmit} noValidate>
            {error && <div className="alert alert-danger">{error}</div>}
            <Input
              {...form.getFieldProps("email")}
              type="email"
              label="Email"
              required
              error={form.touched.email && form.errors.email}
            />

            <Input
              {...form.getFieldProps("password")}
              type="password"
              label="Password"
              autoComplete="on"
              required
              error={form.touched.password && form.errors.password}
            />

            <div className="my-2">
              <button
                type="click"
                disabled={!form.isValid}
                className="btn btn-primary"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
        <div className="col-sm-3 "></div>
      </div>
    </>
  );
};

export default SignIn;
