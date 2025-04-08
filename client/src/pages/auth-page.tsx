import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const res = await apiRequest("GET", "/api/user");
        if (res.ok) {
          const userData = await res.json();
          if (userData) {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        // Not logged in, stay on auth page
      }
    }
    
    checkAuthStatus();
  }, [navigate]);

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
    },
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
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    try {
      setIsRegistering(true);
      // Remove confirmPassword as it's not in the schema
      const { confirmPassword, ...registrationData } = data;
      const res = await apiRequest("POST", "/api/register", registrationData);
      const user = await res.json();
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Form Section */}
      <div className="flex items-center justify-center p-6 md:p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 mb-4">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ClientPro</h1>
            <p className="text-sm text-gray-500 mt-2">
              Manage your clients and projects with ease
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
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
                    {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500">
                  Don't have an account?{" "}
                  <button 
                    type="button" 
                    className="text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => setActiveTab("register")}
                  >
                    Register
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
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
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
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
                    {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center text-sm">
                <p className="text-gray-500">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    className="text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => setActiveTab("login")}
                  >
                    Login
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden md:flex items-center justify-center p-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">
            Manage your clients and projects seamlessly
          </h2>
          <p className="text-primary-100 mb-6">
            ClientPro helps freelancers and small businesses to track projects, share progress with clients, and deliver professional estimates - all in one place.
          </p>
          
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure client sharing via unique link</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Track project milestones and progress</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Professional estimates and project documentation</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Simple file sharing with your clients</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
