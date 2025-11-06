import { AppWindowIcon, CodeIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginSuccess,
    },
  ] = useLoginUserMutation(); // FIXED

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);
  };

  useEffect(() => {
    if (registerSuccess && registerData) {
      toast.success(registerData?.message || "Signup Successful");
    }
    if (registerError) {
      const msg =
        registerError?.data?.message || registerError?.error || "Signup Failed";
      toast.error(msg);
    }
    if (loginSuccess && loginData) {
      toast.success(loginData?.message || "Login Successful");
      navigate("/");
    }
    if (loginError) {
      const msg =
        loginError?.data?.message || loginError?.error || "Login Failed";
      toast.error(msg);
    }
  }, [
    loginIsLoading,
    registerIsLoading,
    loginData,
    registerData,
    loginError,
    registerError,
  ]);

  console.log({ registerData, loginData, registerError, loginError });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 dark:from-[#050505] dark:via-[#0A0A0A] dark:to-[#1a1a1a] transition-all duration-500 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-[#111]/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800"
      >
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <TabsTrigger
              value="signup"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              Signup
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              Login
            </TabsTrigger>
          </TabsList>

          {/* Signup Tab */}
          <TabsContent value="signup" asChild>
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-md dark:shadow-none dark:bg-[#0D0D0D] border dark:border-gray-800 rounded-xl">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Signup
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Create a new account & click signup when you're done.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label>Name</Label>
                    <Input
                      type="text"
                      name="name"
                      value={signupInput.name}
                      onChange={(e) => changeInputHandler(e, "signup")}
                      placeholder="Eg. Noor"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={signupInput.email}
                      placeholder="Eg. noor@gmail.com"
                      onChange={(e) => changeInputHandler(e, "signup")}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>Password</Label>
                    <Input
                      name="password"
                      value={signupInput.password}
                      type="password"
                      placeholder="********"
                      onChange={(e) => changeInputHandler(e, "signup")}
                      required
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    disabled={registerIsLoading}
                    onClick={() => handleRegistration("signup")}
                    className="w-full font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white shadow-md transition-all duration-300"
                  >
                    {registerIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                        wait
                      </>
                    ) : (
                      "Signup"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Login Tab */}
          <TabsContent value="login" asChild>
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-md dark:shadow-none dark:bg-[#0D0D0D] border dark:border-gray-800 rounded-xl">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Login
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Enter your Password here & click Login.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      value={loginInput.email}
                      type="email"
                      placeholder="Eg. noor@gmail.com"
                      onChange={(e) => changeInputHandler(e, "login")}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>Password</Label>
                    <Input
                      name="password"
                      value={loginInput.password}
                      type="password"
                      placeholder="********"
                      onChange={(e) => changeInputHandler(e, "login")}
                      required
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    disabled={loginIsLoading}
                    onClick={() => handleRegistration("login")}
                    className="w-full font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white shadow-md transition-all duration-300"
                  >
                    {loginIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
export default Login;
