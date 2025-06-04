import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { adminService, User, PaginatedResponse } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'instructors' | 'students'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('ALL');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalAdmins: 0
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, [currentPage, selectedRole]);

  const fetchDashboardStats = async () => {
    try {
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response: PaginatedResponse<User>;
      
      if (selectedRole === 'ALL') {
        response = await adminService.getAllUsers(currentPage, 10);
      } else {
        response = await adminService.getUsersByRole(selectedRole, currentPage, 10);
      }
      
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: number, newRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      await fetchUsers(); // Refresh the user list
      await fetchDashboardStats(); // Refresh stats
    } catch (error: any) {
      setError('Failed to update user role. Please try again.');
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      await fetchUsers(); // Refresh the user list
      await fetchDashboardStats(); // Refresh stats
    } catch (error: any) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRoleFilter = (role: 'ALL' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    setSelectedRole(role);
    setCurrentPage(0); // Reset to first page when changing filter
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    return filtered;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4 text-red-500" />;
      case 'INSTRUCTOR': return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'STUDENT': return <BookOpen className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'INSTRUCTOR': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 text-red-500 mr-2" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage users and system settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Instructors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['overview', 'users', 'instructors', 'students'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                    <p className="text-sm text-gray-600">System activity monitoring coming soon...</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={selectedRole}
                      onChange={(e) => handleRoleFilter(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="STUDENT">Students</option>
                      <option value="INSTRUCTOR">Instructors</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <>
                    {/* Users List */}
                    <div className="space-y-4 mb-6">
                      {getFilteredUsers().map((user) => (
                        <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName[0]}{user.lastName[0]}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <div className="ml-2 flex items-center">
                                    {getRoleIcon(user.role)}
                                  </div>
                                  {user.isVerified ? (
                                    <UserCheck className="h-4 w-4 text-green-500 ml-1" />
                                  ) : (
                                    <UserX className="h-4 w-4 text-red-500 ml-1" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="flex items-center mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {user.role}
                                  </span>
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {/* Role Change Dropdown */}
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleUpdate(user.id, e.target.value as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN')}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="STUDENT">Student</option>
                                <option value="INSTRUCTOR">Instructor</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                          Showing {currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements} results
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-2 text-sm font-medium text-gray-700">
                            Page {currentPage + 1} of {totalPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {(activeTab === 'instructors' || activeTab === 'students') && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">{activeTab} Management</h3>
                <p className="text-gray-600">
                  Use the "Users" tab to manage all user roles, including {activeTab}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
