import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Clock, Mail, CheckCircle } from 'lucide-react';

const AwaitingApproval = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf1] to-[#bb9477]/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#bb9477]/30 shadow-lg">
        <CardHeader className="text-center bg-[#472816] text-[#fffaf1] rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Clock className="w-12 h-12 text-[#bb9477]" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 text-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-[#472816]">
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Email Sent</span>
            </div>
            
            <p className="text-[#3f2d1d] leading-relaxed">
              Thank you for registering for Content Strategy Planner! Your account has been created successfully and is currently pending approval from our team.
            </p>
            
            <div className="bg-[#bb9477]/10 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-[#472816] flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                What happens next?
              </h3>
              <ul className="text-sm text-[#3f2d1d] space-y-1">
                <li>• We'll review your application within 1-2 business days</li>
                <li>• You'll receive an email once your account is approved</li>
                <li>• Full access to all features will be granted upon approval</li>
              </ul>
            </div>
            
            <div className="bg-[#472816]/5 rounded-lg p-4">
              <h4 className="font-medium text-[#472816] mb-2">Once approved, you'll have access to:</h4>
              <ul className="text-sm text-[#3f2d1d] text-left space-y-1">
                <li>✨ Advanced content planning tools</li>
                <li>📸 Instagram preview and scheduling</li>
                <li>💡 Content brainstorming features</li>
                <li>📊 Analytics tracking and insights</li>
                <li>🗓️ Monthly content calendars</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t border-[#bb9477]/20">
            <p className="text-xs text-[#3f2d1d]/60 mb-4">
              Need to use a different account?
            </p>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="border-[#bb9477] text-[#472816] hover:bg-[#bb9477]/10"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AwaitingApproval;