import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import z from "zod";
import CloseIcon from "../../UIComponents/Icons/Close";
import { loginUser } from "../../../services/loginService";
import axios from "axios";
import LoadingDots from "../../UIComponents/Loader";
import { useAuth } from "../../../Context/AuthContext";
import "../formeStyle.css";
import "./style.css";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const [imgSrc, setImgSrc] = useState("/images/user.png");
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    console.log("Submitting form with data:", data);
    try {
      setLoading(true);
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });
      console.log("Login successful:", response);
      setLoading(false);
      login();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        setLoginError(errorMessage + " Please try again");
        setLoading(false);
      } else {
        setLoginError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <form
      className="form-container flex-center-column-large-gap"
      onSubmit={handleSubmit(onSubmit)}
    >
      {loginError && <div className="text-danger">{loginError}</div>}
      <div className="form-close-icon">
        <CloseIcon color="#fff" />
      </div>
      <p className="form-title">login</p>

      <div className="form-image-profile">
        {imgSrc && <img src={imgSrc} alt="Preview" className="register-img" />}
      </div>

      <div className="form-input-box">
        <input
          {...register("email")}
          type="email"
          id="email"
          placeholder="UserName@gmail.com"
          className="email"
          autoComplete="email"
        />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
      </div>
      <div className="form-input-box">
        <input
          {...register("password")}
          type="password"
          id="password"
          placeholder="Password"
          className="password"
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-danger">{errors.password.message}</p>
        )}
      </div>
      {loading ? (
        <div className="main-loader-section">
          <LoadingDots />
        </div>
      ) : (
        <div className="buttons-box flex-center-column-gap">
          <button type="submit" className="btn-l">
            Sign in
          </button>
          <p>or</p>
          <Link to="/register">
            <button className="btn-l">Sign un</button>
          </Link>
        </div>
      )}
    </form>
  );
}

export default Login;
