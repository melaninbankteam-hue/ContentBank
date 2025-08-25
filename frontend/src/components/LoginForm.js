import React, { useState, createContext, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "../hooks/use-toast";

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('csp-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    
    // Check if user exists and is approved
    const allUsers = JSON.parse(localStorage.getItem('csp-all-users') || '[]');
    const existingUser = allUsers.find(u => u.email === email);
    
    if (existingUser) {
      if (existingUser.status === 'suspended') {
        setIsLoading(false);
        return { success: false, error: "Your account has been suspended. Please contact support." };
      }
      
      if (existingUser.status === 'active') {
        // Update last active
        existingUser.lastActive = new Date().toISOString();
        localStorage.setItem('csp-all-users', JSON.stringify(allUsers));
        
        setUser(existingUser);
        localStorage.setItem('csp-user', JSON.stringify(existingUser));
        localStorage.setItem('csp-auth-token', 'demo-token-' + Date.now());
        setIsLoading(false);
        return { success: true };
      }
    }
    
    // Check if it's the admin login
    if (email === 'admin@melaninbank.com' && password) {
      const adminUser = {
        id: 'admin-1',
        email: 'admin@melaninbank.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setUser(adminUser);
      localStorage.setItem('csp-user', JSON.stringify(adminUser));
      localStorage.setItem('csp-auth-token', 'admin-token-' + Date.now());
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: "Invalid credentials or account not approved" };
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    
    // Check if user already exists
    const allUsers = JSON.parse(localStorage.getItem('csp-all-users') || '[]');
    const pendingUsers = JSON.parse(localStorage.getItem('csp-pending-users') || '[]');
    
    const userExists = allUsers.find(u => u.email === email);
    const pendingExists = pendingUsers.find(u => u.email === email);
    
    if (userExists || pendingExists) {
      setIsLoading(false);
      return { success: false, error: "An account with this email already exists or is pending approval" };
    }
    
    // Add to pending users
    const newPendingUser = {
      id: 'pending-' + Date.now(),
      email: email,
      name: name,
      requestedAt: new Date().toISOString(),
      message: "New user registration request"
    };
    
    const updatedPending = [...pendingUsers, newPendingUser];
    localStorage.setItem('csp-pending-users', JSON.stringify(updatedPending));
    
    setIsLoading(false);
    return { 
      success: true, 
      message: "Registration submitted! Your account is pending admin approval. You'll receive access once approved." 
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('csp-user');
    localStorage.removeItem('csp-auth-token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const LoginForm = () => {
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: result.error || "Please check your credentials.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(registerData.name, registerData.email, registerData.password);
    
    if (result.success) {
      toast({
        title: "Registration Submitted!",
        description: result.message || "Your account is pending approval.",
      });
      // Reset form
      setRegisterData({ name: '', email: '', password: '' });
    } else {
      toast({
        title: "Registration Failed",
        description: result.error || "Please check your information.",
        variant: "destructive"
      });
    }
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
            <p className="text-xs text-[#3f2d1d]/60">
              Demo Mode: Use any email and password to access the app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;