import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters."
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters."
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters."
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters."
  }),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }).optional(),
  userType: z.enum(["client", "supplier"])
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function HomePage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [userType, setUserType] = useState<"client" | "supplier">("supplier");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      userType
    }
  });

  async function onLoginSubmit(data: LoginFormValues) {
    try {
      setIsLoggingIn(true);
      const res = await apiRequest("POST", "/api/login", data);
      const user = await res.json();
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    try {
      setIsRegistering(true);
      const res = await apiRequest("POST", "/api/register", data);
      const user = await res.json();
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero section */}
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-500">
              {t("home.title")}
            </span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-xl">
            {t("home.subtitle")}
          </p>
          <div className="flex space-x-4">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700" onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}>
              {t("home.getStarted")}
            </Button>
            <Button size="lg" variant="outline" className="border-primary-600 text-primary-600 hover:bg-primary-50">
              {t("home.learnMore")}
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2 mt-12 lg:mt-0">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="flex mb-8 space-x-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">C</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{t("home.preview.clientName")}</p>
                    <p className="text-xs text-gray-500">{t("home.preview.clientStatus")}</p>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-md border border-gray-200">
                  <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="bg-primary-100 p-3 rounded-lg flex-1">
                  <div className="h-2 w-full bg-primary-200 rounded mb-2"></div>
                  <div className="h-8 w-8 mx-auto rounded-full bg-primary-500 text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6"></path><path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path></svg>
                  </div>
                  <div className="h-2 w-2/3 mx-auto bg-primary-200 rounded mt-2"></div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg flex-1">
                  <div className="h-2 w-full bg-blue-200 rounded mb-2"></div>
                  <div className="h-8 w-8 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  </div>
                  <div className="h-2 w-2/3 mx-auto bg-blue-200 rounded mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("home.features.title")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.clientManagement.title")}</h3>
              <p className="text-gray-600">{t("home.features.clientManagement.description")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"></path><path d="M2 10h20"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.projectTracking.title")}</h3>
              <p className="text-gray-600">{t("home.features.projectTracking.description")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600"><path d="M22 8a.76.76 0 0 0 0-.21v-.08a.77.77 0 0 0-.07-.16.35.35 0 0 0-.05-.08l-.1-.13-.08-.06-.12-.09-.09-.03L11.09 2h-.18L.73 7.23A.77.77 0 0 0 .5 7.7v8.6a.77.77 0 0 0 .23.47l10.5 6h.08a.8.8 0 0 0 .08 0 .8.8 0 0 0 .08 0h.08l10.5-6a.76.76 0 0 0 .23-.47V8.38v-.08z"></path><path d="M11 12 .69 7.65"></path><path d="M11 12v10.5"></path><path d="M11 12 21.32 7.65"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("home.features.clientPortal.title")}</h3>
              <p className="text-gray-600">{t("home.features.clientPortal.description")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication section */}
      <div id="auth-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{t("home.auth.title")}</h2>
              <p className="text-gray-600">{t("home.auth.subtitle")}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary-50 inline-flex p-1 rounded-lg">
                    <button
                      className={`px-4 py-2 rounded-md ${userType === "supplier" ? "bg-primary-600 text-white" : "text-gray-700"}`}
                      onClick={() => {
                        setUserType("supplier");
                        registerForm.setValue("userType", "supplier");
                      }}
                    >
                      {t("home.auth.asSupplier")}
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md ${userType === "client" ? "bg-primary-600 text-white" : "text-gray-700"}`}
                      onClick={() => {
                        setUserType("client");
                        registerForm.setValue("userType", "client");
                      }}
                    >
                      {t("home.auth.asClient")}
                    </button>
                  </div>
                </div>

                <Tabs defaultValue="login" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                    <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("auth.loginTitle")}</CardTitle>
                        <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.username")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("auth.usernamePlaceholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.password")}</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder={t("auth.passwordPlaceholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={isLoggingIn}
                            >
                              {isLoggingIn ? t("auth.loggingIn") : t("auth.login")}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="register">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("auth.registerTitle")}</CardTitle>
                        <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <FormField
                              control={registerForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.fullName")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("auth.fullNamePlaceholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.username")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("auth.usernamePlaceholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.password")}</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder={t("auth.passwordPlaceholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t("auth.email")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("auth.emailPlaceholder")} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={isRegistering}
                            >
                              {isRegistering ? t("auth.registering") : t("auth.register")}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">C</span>
                </div>
                <span className="ml-2 text-xl font-semibold">{t("common.appName")}</span>
              </div>
              <p className="text-gray-400 mb-4">{t("footer.description")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.links.title")}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">{t("footer.links.home")}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t("footer.links.features")}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t("footer.links.pricing")}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">{t("footer.links.contact")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.contact.title")}</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5-2.5l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path></svg>
                  +39 123 456 7890
                </li>
                <li className="flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  info@clientpro.com
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            &copy; {new Date().getFullYear()} ClientPro. {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}