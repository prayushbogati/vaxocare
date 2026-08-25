import { useEffect, useMemo, useState } from "react";
import { Search, UserX, UserCheck, KeyRound, ShieldCheck } from "lucide-react";
import { api } from "../../apis";
import { Btn, Badge, Avatar, Table, Tr, Td, cn, Select, Input, Modal } from "./UI";

const roleBadge = { parent: "blue", provider: "green", admin: "orange" };
const statusBadge = { active: "green", inactive: "gray", pending: "yellow" };

const ManageUsersSection = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [busyId, setBusyId] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.adminAllUsers();
      const list = Array.isArray(data)
        ? data
        : (data?.users ?? data?.data ?? []);
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      showToast?.(e?.message || "Failed to load users", "danger");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedUsers = useMemo(() => {
    return (users || []).map((u) => {
      const id = u._id || u.id;
      const name = u.name || u.fullName || u.username || "—";
      const email = u.email || "—";
      const role = u.role || "parent";

      let status = "inactive";
      if (typeof u.isActive === "boolean") {
        if (!u.isActive) status = "inactive";
        else status = u.role === "provider" && u.isApproved === false ? "pending" : "active";
      }

      const joined = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—";

      return { id, name, email, role, status, joined };
    });
  }, [users]);

  const filtered = normalizedUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const startBusy = (id) => setBusyId(id);
  const stopBusy = () => setBusyId(null);

  const activateUser = async (user) => {
    if (!user?.id) return;
    try {
      startBusy(user.id);
      await api.adminActivateUser(user.id);
      showToast?.(`${user.name} activated`, "success");
      await loadUsers();
    } catch (e) {
      showToast?.(e?.message || "Failed to activate user", "danger");
    } finally {
      stopBusy();
    }
  };

  const deactivateUser = async (user) => {
    if (!user?.id) return;
    try {
      const reason = window.prompt("Deactivation reason (optional)", "Deactivated by admin");
      startBusy(user.id);
      await api.adminDeactivateUser(user.id, { reason: reason || "" });
      showToast?.(`${user.name} deactivated`, "warning");
      await loadUsers();
    } catch (e) {
      showToast?.(e?.message || "Failed to deactivate user", "danger");
    } finally {
      stopBusy();
    }
  };

  const updateRole = async (user, role) => {
    if (!user?.id) return;
    try {
      startBusy(user.id);
      await api.adminUpdateUserRole(user.id, { role });
      showToast?.(`${user.name} role updated`, "success");
      await loadUsers();
    } catch (e) {
      showToast?.(e?.message || "Failed to update role", "danger");
    } finally {
      stopBusy();
    }
  };

  const openResetModal = (user) => {
    setResetUser(user);
    setResetPassword("");
  };

  const confirmResetPassword = async () => {
    if (!resetUser?.id) return;
    try {
      if (!resetPassword || resetPassword.length < 6) {
        showToast?.("Password must be at least 6 characters", "warning");
        return;
      }
      startBusy(resetUser.id);
      await api.adminResetUserPassword(resetUser.id, { newPassword: resetPassword });
      showToast?.("Password reset successfully", "success");
      setResetUser(null);
      await loadUsers();
    } catch (e) {
      showToast?.(e?.message || "Failed to reset password", "danger");
    } finally {
      stopBusy();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Users & Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control access (activate/deactivate), update roles, and reset passwords.
          </p>
        </div>

        <Btn variant="outline" onClick={loadUsers} disabled={loading}>
          <ShieldCheck size={16} /> Refresh
        </Btn>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-[180px]">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="text-sm outline-none w-full placeholder-gray-400"
          />
        </div>

        <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
          {["all", "parent", "provider", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-0 capitalize",
                roleFilter === r ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {r === "all" ? "All Roles" : r}
            </button>
          ))}
        </div>

        <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
          {["all", "active", "inactive", "pending"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-0 capitalize",
                statusFilter === s ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700",
              )}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table heads={["User", "Email", "Role", "Status", "Joined", "Actions"]}>
          {loading && filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                Loading…
              </td>
            </tr>
          )}

          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                No users match the current filters.
              </td>
            </tr>
          )}

          {filtered.map((user) => (
            <Tr key={user.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  </div>
                </div>
              </Td>

              <Td>{user.email}</Td>

              <Td>
                <div className="flex items-center gap-2">
                  <Badge color={roleBadge[user.role] || "gray"}>{user.role}</Badge>
                  <Select
                    value={user.role}
                    onChange={(e) => updateRole(user, e.target.value)}
                    disabled={busyId === user.id}
                    className="w-32"
                  >
                    <option value="parent">parent</option>
                    <option value="provider">provider</option>
                    <option value="admin">admin</option>
                  </Select>
                </div>
              </Td>

              <Td>
                <Badge color={statusBadge[user.status]}>{user.status}</Badge>
              </Td>

              <Td gray>{user.joined}</Td>

              <Td>
                <div className="flex gap-1.5 flex-wrap">
                  {user.status === "active" ? (
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => deactivateUser(user)}
                      disabled={busyId === user.id}
                    >
                      <UserX size={12} /> Deactivate
                    </Btn>
                  ) : (
                    <Btn
                      variant="success"
                      size="sm"
                      onClick={() => activateUser(user)}
                      disabled={busyId === user.id}
                    >
                      <UserCheck size={12} /> Activate
                    </Btn>
                  )}

                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() => openResetModal(user)}
                    disabled={busyId === user.id}
                  >
                    <KeyRound size={12} /> Reset Password
                  </Btn>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>

      {/* Reset password modal */}
      <Modal
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        title="Reset User Password"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setResetUser(null)}
              disabled={busyId === resetUser?.id}
            >
              Cancel
            </Btn>
            <Btn
              variant="primary"
              onClick={confirmResetPassword}
              disabled={busyId === resetUser?.id}
            >
              Confirm Reset
            </Btn>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            User: <span className="font-semibold text-gray-800">{resetUser?.name}</span>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              New Password *
            </div>
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsersSection;
