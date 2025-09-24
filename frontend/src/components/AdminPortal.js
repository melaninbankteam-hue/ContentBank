import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Database,
  Mail,
  Cloud,
  Shield,
  Globe
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const AdminPortal = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState({});
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingMembers: 0,
    approvedMembers: 0,
    deniedMembers: 0
  });
  const [activeFilter, setActiveFilter] = useState('all'); // New filter state

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Filter users based on active filter
  const getFilteredUsers = () => {
    switch (activeFilter) {
      case 'pending':
        return users.filter(u => u.approval_status === 'pending');
      case 'approved':
        return users.filter(u => u.approval_status === 'approved');
      case 'denied':
        return users.filter(u => u.approval_status === 'denied');
      default:
        return users;
    }
  };

  useEffect(() => {
    fetchUsers();
    checkHealthStatus();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('AdminPortal: Starting to fetch users...');
      console.log('Backend URL:', BACKEND_URL);
      
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      
      const userData = response.data;
      console.log('Fetched users:', userData);
      console.log('Pending users:', userData.filter(u => u.approval_status === 'pending'));
      setUsers(userData);
      
      // Calculate stats - Total members should only include approved/active members
      const stats = {
        totalMembers: userData.filter(u => u.approval_status === 'approved' && u.is_active !== false).length,
        pendingMembers: userData.filter(u => u.approval_status === 'pending').length,
        approvedMembers: userData.filter(u => u.approval_status === 'approved').length,
        deniedMembers: userData.filter(u => u.approval_status === 'denied').length
      };
      console.log('Calculated stats:', stats);
      setStats(stats);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      toast({
        title: "Error",
        description: "Failed to fetch users: " + (error.response?.data?.detail || error.message),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkHealthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/health`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Error checking health:', error);
      setHealthStatus({
        mongo: false,
        jwt: false,
        cloudinary: false,
        email: false,
        cors: false
      });
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BACKEND_URL}/api/admin/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "User Approved",
        description: "User has been approved and notified via email",
      });
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive"
      });
    }
  };

  const handleDeny = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BACKEND_URL}/api/admin/users/${userId}/deny`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "User Denied",
        description: "User has been denied and notified via email",
      });
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error denying user:', error);
      toast({
        title: "Error",
        description: "Failed to deny user",
        variant: "destructive"
      });
    }
  };

  // Delete user function
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user request?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "User Deleted",
        description: "User request has been permanently deleted.",
      });
      
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: "secondary", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      approved: { variant: "default", color: "bg-green-100 text-green-800 border-green-200" },
      denied: { variant: "destructive", color: "bg-red-100 text-red-800 border-red-200" }
    };
    
    return (
      <Badge className={variants[status]?.color || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const HealthIndicator = ({ label, status, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#472816]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {status ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#472816] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#472816] font-medium">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf1] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#472816] mb-2">Admin Portal</h1>
          <p className="text-[#3f2d1d]">Manage users and monitor system health</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#bb9477]/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#472816]" />
                <div>
                  <p className="text-sm text-[#3f2d1d]">Total Members</p>
                  <p className="text-2xl font-bold text-[#472816]">{stats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#bb9477]/30 cursor-pointer hover:bg-[#bb9477]/5 transition-colors" onClick={() => setActiveFilter('pending')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-[#3f2d1d]">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#bb9477]/30 cursor-pointer hover:bg-[#bb9477]/5 transition-colors" onClick={() => setActiveFilter('approved')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-[#3f2d1d]">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[#bb9477]/30 cursor-pointer hover:bg-[#bb9477]/5 transition-colors" onClick={() => setActiveFilter('denied')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-[#3f2d1d]">Denied</p>
                  <p className="text-2xl font-bold text-red-600">{stats.deniedMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#3f2d1d] mb-6">
            <TabsTrigger value="members" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              Members
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-[#3f2d1d] text-[#fffaf1]">
              Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card className="border-[#bb9477]/30">
              <CardHeader className="bg-gradient-to-r from-[#bb9477] to-[#472816] text-[#fffaf1] rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle>Member Management</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setActiveFilter('all')}
                      className={`${activeFilter === 'all' ? 'bg-white text-[#472816]' : 'bg-[#bb9477]/20 text-white'}`}
                    >
                      All ({users.length})
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setActiveFilter('pending')}
                      className={`${activeFilter === 'pending' ? 'bg-white text-[#472816]' : 'bg-[#bb9477]/20 text-white'}`}
                    >
                      Pending ({stats.pendingMembers})
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setActiveFilter('approved')}
                      className={`${activeFilter === 'approved' ? 'bg-white text-[#472816]' : 'bg-[#bb9477]/20 text-white'}`}
                    >
                      Approved ({stats.approvedMembers})
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setActiveFilter('denied')}
                      className={`${activeFilter === 'denied' ? 'bg-white text-[#472816]' : 'bg-[#bb9477]/20 text-white'}`}
                    >
                      Denied ({stats.deniedMembers})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredUsers().map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-[#bb9477]/20 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#472816]">{user.name}</h3>
                          {getStatusBadge(user.approval_status)}
                        </div>
                        <p className="text-sm text-[#3f2d1d] mb-1">{user.email}</p>
                        {user.social_handle && (
                          <p className="text-sm text-[#3f2d1d] mb-1">@{user.social_handle}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#3f2d1d]/60">
                          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                          <span>Last Active: {formatLastActivity(user.last_active)}</span>
                          <span>Status: {user.is_active ? 'Active' : 'Inactive'}</span>
                          <span>Posts: {user.total_posts || 0}</span>
                          <span>Login Count: {user.login_count || 0}</span>
                        </div>
                      </div>
                      
                      {user.approval_status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeny(user.id)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUser(user.id)}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                      
                      {user.approval_status !== 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUser(user.id)}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center py-8 text-[#3f2d1d]/60">
                      No users found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card className="border-[#bb9477]/30">
              <CardHeader>
                <CardTitle className="text-[#472816]">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HealthIndicator 
                    label="MongoDB Atlas" 
                    status={healthStatus.mongo} 
                    icon={Database} 
                  />
                  <HealthIndicator 
                    label="JWT Authentication" 
                    status={healthStatus.jwt} 
                    icon={Shield} 
                  />
                  <HealthIndicator 
                    label="Cloudinary Media" 
                    status={healthStatus.cloudinary} 
                    icon={Cloud} 
                  />
                  <HealthIndicator 
                    label="Email Service" 
                    status={healthStatus.email} 
                    icon={Mail} 
                  />
                  <HealthIndicator 
                    label="CORS Configuration" 
                    status={healthStatus.cors} 
                    icon={Globe} 
                  />
                </div>
                
                <div className="mt-6 p-4 bg-[#bb9477]/10 rounded-lg">
                  <h4 className="font-semibold text-[#472816] mb-2">Environment Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>MongoDB: {healthStatus.mongo ? '✅ Connected' : '❌ Disconnected'}</div>
                    <div>JWT: {healthStatus.jwt ? '✅ Valid' : '❌ Invalid'}</div>
                    <div>Cloudinary: {healthStatus.cloudinary ? '✅ Connected' : '❌ Not configured'}</div>
                    <div>Email: {healthStatus.email ? '✅ Working' : '❌ Not configured'}</div>
                    <div>CORS: {healthStatus.cors ? '✅ Configured' : '❌ Not configured'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;