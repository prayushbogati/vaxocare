import { AlertTriangle, Info, Database, RefreshCw } from "lucide-react";
import { Modal, Btn, Input, Select, Textarea, FormGroup } from "./ui";
import { useState } from "react";

/* ─── 1. Add / Edit User ─── */
export const AddUserModal = ({ open, onClose, showToast, editMode = false }) => (
    <Modal
        open={open}
        onClose={onClose}
        title={editMode ? "Edit User" : "Add New User"}
        footer={
            <>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                <Btn variant="primary" onClick={() => { onClose(); showToast(editMode ? "User updated!" : "User created!", "success"); }}>
                    {editMode ? "Save Changes" : "Create User"}
                </Btn>
            </>
        }
    >
        <div className="grid grid-cols-2 gap-4">
            <FormGroup label="First Name *"><Input placeholder="e.g. Sarah" defaultValue={editMode ? "Sarah" : ""} /></FormGroup>
            <FormGroup label="Last Name *"><Input placeholder="e.g. Rana" defaultValue={editMode ? "Rana" : ""} /></FormGroup>
            <FormGroup label="Email Address *" full><Input type="email" placeholder="user@email.com" defaultValue={editMode ? "sarah.rana@email.com" : ""} /></FormGroup>
            <FormGroup label="Phone Number"><Input type="tel" placeholder="+977 98xxxxxxxx" /></FormGroup>
            <FormGroup label="Role *">
                <Select defaultValue={editMode ? "parent" : ""}>
                    <option value="">Select role</option>
                    <option value="parent">Parent</option>
                    <option value="provider">Healthcare Provider</option>
                    <option value="organization">Organization</option>
                    <option value="admin">System Admin</option>
                </Select>
            </FormGroup>
            <FormGroup label="Account Status">
                <Select defaultValue="active">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </Select>
            </FormGroup>
            {!editMode && (
                <>
                    <FormGroup label="Password *"><Input type="password" placeholder="Min. 8 characters" /></FormGroup>
                    <FormGroup label="Confirm Password *"><Input type="password" placeholder="Repeat password" /></FormGroup>
                </>
            )}
            <FormGroup label="Notes" full><Textarea placeholder="Optional admin notes about this user…" /></FormGroup>
        </div>
    </Modal>
);

/* ─── 2. Reject Provider (with reason) ─── */
export const RejectProviderModal = ({ open, onClose, showToast }) => (
    <Modal
        open={open}
        onClose={onClose}
        title="Reject Provider Registration"
        footer={
            <>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                <Btn variant="danger" onClick={() => { onClose(); showToast("Provider registration rejected.", "danger"); }}>
                    Confirm Rejection
                </Btn>
            </>
        }
    >
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700 mb-4">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            The provider will be notified by email with the reason for rejection. They can reapply after addressing the issues.
        </div>
        <div className="space-y-4">
            <FormGroup label="Rejection Reason *">
                <Select>
                    <option value="">Select reason</option>
                    <option>Incomplete documentation</option>
                    <option>Invalid license</option>
                    <option>Unverifiable address</option>
                    <option>Duplicate registration</option>
                    <option>Failed compliance check</option>
                    <option>Other</option>
                </Select>
            </FormGroup>
            <FormGroup label="Additional Details">
                <Textarea placeholder="Explain specific issues the provider should address before reapplying…" />
            </FormGroup>
        </div>
    </Modal>
);

/* ─── 3. Send Notification Modal (quick) ─── */
export const SendNotifModal = ({ open, onClose, showToast }) => (
    <Modal
        open={open}
        onClose={onClose}
        title="Send Notification Reminder"
        footer={
            <>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                <Btn variant="primary" onClick={() => { onClose(); showToast("Notification sent successfully!", "success"); }}>
                    Send Now
                </Btn>
            </>
        }
    >
        <div className="space-y-4">
            <FormGroup label="Title *"><Input placeholder="e.g. Vaccine Due Reminder" /></FormGroup>
            <FormGroup label="Target Audience *">
                <Select>
                    <option value="">Select recipients</option>
                    <option>All Users</option>
                    <option>All Parents</option>
                    <option>All Providers</option>
                    <option>Parents with overdue vaccines</option>
                    <option>Parents with upcoming appointments</option>
                    <option>Specific User</option>
                </Select>
            </FormGroup>
            <FormGroup label="Notification Type">
                <Select>
                    <option>Reminder</option>
                    <option>Alert</option>
                    <option>System Notice</option>
                    <option>Informational</option>
                </Select>
            </FormGroup>
            <FormGroup label="Message *">
                <Textarea placeholder="Write the notification message…" />
            </FormGroup>
            <FormGroup label="Delivery Channel">
                <Select>
                    <option>Email + In-App</option>
                    <option>Email Only</option>
                    <option>SMS Only</option>
                    <option>All Channels</option>
                </Select>
            </FormGroup>
        </div>
    </Modal>
);

/* ─── 4. Database Backup Confirmation ─── */
export const DbBackupModal = ({ open, onClose, showToast }) => {
    const [running, setRunning] = useState(false);
    const handleBackup = () => {
        setRunning(true);
        setTimeout(() => { setRunning(false); onClose(); showToast("Database backup completed successfully!", "success"); }, 2500);
    };
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Trigger Database Backup"
            footer={
                <>
                    <Btn variant="ghost" onClick={onClose} disabled={running}>Cancel</Btn>
                    <Btn variant="primary" onClick={handleBackup} disabled={running}>
                        {running ? <><RefreshCw size={14} className="animate-spin" /> Running…</> : <><Database size={14} /> Start Backup</>}
                    </Btn>
                </>
            }
        >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 text-sm text-yellow-800 mb-4">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                This will trigger a full database backup. It may take a few minutes to complete. The system will remain operational during the backup.
            </div>
            <div className="space-y-4">
                <FormGroup label="Backup Type">
                    <Select><option>Full Backup</option><option>Incremental</option><option>Schema Only</option></Select>
                </FormGroup>
                <FormGroup label="Storage Destination">
                    <Select><option>Local Server</option><option>AWS S3</option><option>Google Cloud Storage</option></Select>
                </FormGroup>
                <FormGroup label="Notes (optional)">
                    <Textarea placeholder="e.g. Pre-deployment backup, pre-migration, etc." />
                </FormGroup>
            </div>
        </Modal>
    );
};

/* ─── 5. View Audit Log Detail ─── */
export const AuditDetailModal = ({ open, onClose, log }) => {
    if (!log) return null;
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Log Detail — ${log.id}`}
            footer={<Btn variant="ghost" onClick={onClose}>Close</Btn>}
        >
            <div className="space-y-3">
                {[
                    ["Log ID", log.id],
                    ["Timestamp", log.time],
                    ["User", log.user],
                    ["Role", log.role],
                    ["Action", log.action],
                    ["Type", log.type],
                    ["IP Address", log.ip],
                ].map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide w-28 shrink-0 pt-0.5">{label}</span>
                        <span className="text-sm text-gray-800 font-medium">{value}</span>
                    </div>
                ))}
            </div>
        </Modal>
    );
};