import React, { useState } from 'react';
import {
  Users2,
  UserPlus,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  Lock,
  Mail,
  Building,
  Check,
  XCircle,
  Edit2
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UsersManagementViewProps {
  users: User[];
  currentUser: User;
  onCreateUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onToggleStatus: (userId: string) => void;
  onToggle2FA: (userId: string) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  currentUser,
  onCreateUser,
  onUpdateRole,
  onToggleStatus,
  onToggle2FA
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Employee');
  const [newDepartment, setNewDepartment] = useState('Metallurgy & Quality Assurance');
  const [newDesignation, setNewDesignation] = useState('Assistant Metallurgist');

  const isAdmin = currentUser.role === 'Admin';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newFullName.trim()) return;

    onCreateUser({
      username: newUsername.trim(),
      email: newEmail.trim(),
      fullName: newFullName.trim(),
      role: newRole,
      department: newDepartment,
      designation: newDesignation,
      isActive: true,
      twoFactorEnabled: false
    });

    setNewUsername('');
    setNewEmail('');
    setNewFullName('');
    setShowAddModal(false);
  };

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-red-500/20 text-red-300 border-red-500/40',
    Manager: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Employee: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    Viewer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            User Governance & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-400">
            Manage plant personnel credentials, cryptographic permissions, 2FA policies, and account lifecycles.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-3">Role Policy</th>
                <th className="py-3 px-3">Department & Designation</th>
                <th className="py-3 px-3">2FA (TOTP)</th>
                <th className="py-3 px-3">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Governance Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                        {u.fullName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {u.id === currentUser.id && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded font-mono">YOU</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {isAdmin ? (
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateRole(u.id, e.target.value as UserRole)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border bg-slate-950 focus:outline-none cursor-pointer ${roleColors[u.role]}`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{u.designation}</div>
                    <div className="text-[10px] text-slate-500">{u.department}</div>
                  </td>

                  <td className="py-3 px-3">
                    {isAdmin ? (
                      <button
                        onClick={() => onToggle2FA(u.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          u.twoFactorEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {u.twoFactorEnabled ? 'ENFORCED' : 'OFF'}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {u.twoFactorEnabled ? 'Active' : 'Disabled'}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => onToggleStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            u.isActive
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Rights Matrix Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Sri Vishnu Heat Treaters RBAC Permission Matrix (Security Architecture)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">View Docs</th>
                <th className="py-2.5 px-3">Download (Decrypt)</th>
                <th className="py-2.5 px-3">Upload / Version</th>
                <th className="py-2.5 px-3">Approve / Reject</th>
                <th className="py-2.5 px-3">Recycle Bin Restore</th>
                <th className="py-2.5 px-3">Security & Backups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-3 font-bold text-red-400">Admin</td>
                <td className="py-2.5 px-3 text-emerald-400">All Files</td>
                <td className="py-2.5 px-3 text-emerald-400">Unrestricted</td>
                <td className="py-2.5 px-3 text-emerald-400">All Categories</td>
                <td className="py-2.5 px-3 text-emerald-400">Plant-wide</td>
                <td className="py-2.5 px-3 text-emerald-400">Restore & Purge</td>
                <td className="py-2.5 px-3 text-emerald-400">Full Governance</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-400">Manager</td>
                <td className="py-2.5 px-3 text-emerald-400">All Files</td>
                <td className="py-2.5 px-3 text-emerald-400">Departmental</td>
                <td className="py-2.5 px-3 text-emerald-400">Departmental</td>
                <td className="py-2.5 px-3 text-emerald-400">Departmental</td>
                <td className="py-2.5 px-3 text-slate-500">View Only</td>
                <td className="py-2.5 px-3 text-slate-400">Threat Alerts Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-400">Employee</td>
                <td className="py-2.5 px-3 text-slate-300">Authorized Only</td>
                <td className="py-2.5 px-3 text-slate-300">Authorized Only</td>
                <td className="py-2.5 px-3 text-slate-300">Permitted Types</td>
                <td className="py-2.5 px-3 text-slate-500">No (Uploads Only)</td>
                <td className="py-2.5 px-3 text-slate-500">No Access</td>
                <td className="py-2.5 px-3 text-slate-500">No Access</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-400">Viewer / Auditor</td>
                <td className="py-2.5 px-3 text-slate-300">Approved Certs</td>
                <td className="py-2.5 px-3 text-slate-300">Read-Only Certs</td>
                <td className="py-2.5 px-3 text-slate-500">No Access</td>
                <td className="py-2.5 px-3 text-slate-500">No Access</td>
                <td className="py-2.5 px-3 text-slate-500">No Access</td>
                <td className="py-2.5 px-3 text-slate-500">SHA-256 Verify Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create User Account</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. S. Meenakshi Sundaram"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Username:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. meenakshi_qa"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Email Address:</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="meenakshi@srivishnuheattreaters.com"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 block mb-1">Role:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Designation:</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Department:</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                >
                  <option value="Metallurgy & Quality Assurance">Metallurgy & Quality Assurance</option>
                  <option value="Sealed Quench Furnace (SQF) Division">Sealed Quench Furnace (SQF) Division</option>
                  <option value="Induction Hardening Division">Induction Hardening Division</option>
                  <option value="Pyrometry & Furnace Maintenance">Pyrometry & Furnace Maintenance</option>
                  <option value="Commercial & Dispatch">Commercial & Dispatch</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
