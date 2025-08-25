import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Shield, Users, UserCheck, UserX, Search, Mail, Calendar, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const AdminPanel = ({ onClose }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load users from localStorage (in real app, this would be from API)
  useEffect(() => {
    const savedUsers = localStorage.getItem('csp-all-users');
    const savedPending = localStorage.getItem('csp-pending-users');
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with some demo users
      const demoUsers = [
        {
          id: 'admin-1',
          email: 'admin@melaninbank.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          createdAt: new Date('2024-01-01').toISOString(),
          lastActive: new Date().toISOString()
        },
        {
          id: 'user-1',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          role: 'user',
          status: 'active',
          createdAt: new Date('2024-12-01').toISOString(),
          lastActive: new Date().toISOString()
        },
        {
          id: 'user-2',
          email: 'mike@example.com',
          name: 'Mike Chen',
          role: 'user',
          status: 'active',
          createdAt: new Date('2024-12-15').toISOString(),
          lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setUsers(demoUsers);
      localStorage.setItem('csp-all-users', JSON.stringify(demoUsers));
    }

    if (savedPending) {
      setPendingUsers(JSON.parse(savedPending));
    } else {
      // Initialize with some pending users
      const demoPending = [
        {
          id: 'pending-1',
          email: 'jessica@startup.com',
          name: 'Jessica Williams',
          requestedAt: new Date().toISOString(),
          message: 'I run a digital marketing agency and would love to use this tool for my clients.'
        },
        {
          id: 'pending-2',
          email: 'alex@coaching.com',
          name: 'Alex Rodriguez',
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Life coach looking to improve my social media strategy.'
        }
      ];
      setPendingUsers(demoPending);
      localStorage.setItem('csp-pending-users', JSON.stringify(demoPending));
    }
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('csp-all-users', JSON.stringify(updatedUsers));
  };

  const savePendingUsers = (updatedPending) => {
    setPendingUsers(updatedPending);
    localStorage.setItem('csp-pending-users', JSON.stringify(updatedPending));
  };

  const approveUser = (pendingUser) => {
    const newUser = {
      id: `user-${Date.now()}`,
      email: pendingUser.email,
      name: pendingUser.name,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: null
    };

    saveUsers([...users, newUser]);
    savePendingUsers(pendingUsers.filter(u => u.id !== pendingUser.id));

    toast({
      title: "User Approved!",
      description: `${pendingUser.name} has been granted access to the platform.`,
    });
  };

  const rejectUser = (pendingUser) => {
    savePendingUsers(pendingUsers.filter(u => u.id !== pendingUser.id));
    
    toast({
      title: "User Rejected",
      description: `Access request from ${pendingUser.name} has been declined.`,
      variant: "destructive"
    });
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    });

    saveUsers(updatedUsers);
    
    const user = users.find(u => u.id === userId);
    toast({
      title: `User ${user.status === 'active' ? 'Suspended' : 'Activated'}`,
      description: `${user.name} has been ${user.status === 'active' ? 'suspended' : 'reactivated'}.`,
    });
  };

  const deleteUser = (userId) => {
    if (confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      const user = users.find(u => u.id === userId);
      const updatedUsers = users.filter(u => u.id !== userId);
      
      // Also remove their data
      localStorage.removeItem(`csp-monthly-${userId}`);
      
      saveUsers(updatedUsers);
      
      toast({
        title: "User Deleted",
        description: `${user.name} and all their data have been permanently removed.`,
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#472816] to-[#3f2d1d] text-[#fffaf1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-[#fffaf1] hover:bg-[#bb9477]/20">
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#bb9477]/10">
              <TabsTrigger value="users" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Active Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-[#bb9477] data-[state=active]:text-white">
                <UserCheck className="w-4 h-4 mr-2" />
                Pending Approvals ({pendingUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* User Management Controls */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#bb9477]/50 focus:border-[#472816]"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 border-[#bb9477]/50 focus:border-[#472816]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="suspended">Suspended Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="border-[#bb9477]/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#bb9477]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#472816] font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[#3f2d1d]">{user.name}</h3>
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                              {user.role === 'admin' && (
                                <Badge variant="outline" className="bg-[#472816]/10 text-[#472816] border-[#472816]/30">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#3f2d1d]/60">{user.email}</p>
                            <div className="flex gap-4 text-xs text-[#3f2d1d]/50 mt-1">
                              <span>Joined: {formatDate(user.createdAt)}</span>
                              {user.lastActive && (
                                <span>Last active: {formatDate(user.lastActive)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {user.role !== 'admin' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                              className={`border-${user.status === 'active' ? 'red' : 'green'}-500 text-${user.status === 'active' ? 'red' : 'green'}-600 hover:bg-${user.status === 'active' ? 'red' : 'green'}-50`}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <UserX className="w-3 h-3 mr-1" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-[#3f2d1d]/60">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users found matching your search.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <Card key={user.id} className="border-[#bb9477]/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-[#bb9477]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#472816] font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#3f2d1d]">{user.name}</h3>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-[#3f2d1d]/60 mb-2">{user.email}</p>
                            <p className="text-xs text-[#3f2d1d]/50 mb-2">
                              Requested: {formatDate(user.requestedAt)}
                            </p>
                            {user.message && (
                              <p className="text-sm text-[#3f2d1d] bg-[#bb9477]/5 p-3 rounded border-l-4 border-[#bb9477]">
                                "{user.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveUser(user)}
                            className="border-green-500 text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectUser(user)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pendingUsers.length === 0 && (
                  <div className="text-center py-8 text-[#3f2d1d]/60">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending user requests.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;