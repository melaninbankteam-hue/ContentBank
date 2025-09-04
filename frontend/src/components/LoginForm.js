import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "../hooks/use-toast";

const LoginForm = ({ onLogin, onRegister }) => {
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    company: '', 
    role: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await onLogin(loginData.email, loginData.password);
    
    if (result.success) {
      if (result.awaiting) {
        toast({
          title: "Account Pending",
          description: "Your account is awaiting admin approval.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } else {
      toast({
        title: "Login Failed",
        description: result.message || "Please check your credentials.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await onRegister(registerData);
    
    if (result.success) {
      toast({
        title: "Registration Submitted!",
        description: result.message || "Your account is pending approval.",
      });
      // Reset form
      setRegisterData({ name: '', email: '', password: '', company: '', role: '' });
    } else {
      toast({
        title: "Registration Failed",
        description: result.message || "Please check your information.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-[#bb9477]/30 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1] rounded-t-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_insta-content-hub-1/artifacts/dof2dns5_Melanin%20bank%20sublogo.png"
              alt="Melanin Bank"
              className="w-12 h-12 object-contain filter brightness-0 invert"
            />
          </div>
          <CardTitle className="text-2xl">Content Strategy Planner</CardTitle>
          <p className="text-[#bb9477] text-sm mt-2">
            Plan, create and execute your social media strategy
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#bb9477]/10">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#bb9477] hover:bg-[#472816] text-white"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-company">Company</Label>
                  <Input
                    id="register-company"
                    type="text"
                    value={registerData.company}
                    onChange={(e) => setRegisterData({...registerData, company: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Enter your company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-role">Role</Label>
                  <Input
                    id="register-role"
                    type="text"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Enter your role"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="border-[#bb9477]/50 focus:border-[#472816]"
                    placeholder="Create a password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#bb9477] hover:bg-[#472816] text-white"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-[#3f2d1d]/60 text-center">
              New registrations require admin approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;