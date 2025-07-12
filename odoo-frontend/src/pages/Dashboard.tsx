import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Log Out
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Profile Information</h3>
              <ul className="space-y-2">
                <li><span className="font-medium">Email:</span> {user?.email}</li>
                <li><span className="font-medium">Location:</span> {user?.location}</li>
                <li><span className="font-medium">Account Type:</span> {user?.role}</li>
                <li><span className="font-medium">Profile Visibility:</span> {user?.isPublic ? 'Public' : 'Private'}</li>
              </ul>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Skills</h3>
              <div className="mb-4">
                <h4 className="text-sm text-gray-600 mb-1">Skills Offered:</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.skillsOffered?.length ? (
                    user.skillsOffered.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No skills added yet</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-1">Skills Wanted:</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.skillsWanted?.length ? (
                    user.skillsWanted.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {user?.availability?.length ? (
                user.availability.map((time, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {time}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No availability set</span>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
