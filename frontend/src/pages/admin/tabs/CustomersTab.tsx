import { motion } from 'motion/react';
import { Users, Search, Eye, ChevronUp, ChevronDown, Trash2, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import userService from '@/src/services/userService';
import type { User as UserType } from '@/src/services/authService';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function CustomersTab() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleConfirm, setRoleConfirm] = useState<{ user: UserType; newRole: 'ADMIN' | 'USER' } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [viewUser, setViewUser] = useState<UserType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ page: 1, limit: 50, search: search || undefined });
      if (res.success) setUsers(res.data.users);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async () => {
    if (!roleConfirm) return;
    setUpdating(true);
    try {
      const res = await userService.updateUser(roleConfirm.user.id, { role: roleConfirm.newRole });
      if (res.success) setUsers((prev) => prev.map((u) => u.id === roleConfirm.user.id ? { ...u, role: roleConfirm.newRole } : u));
    } catch { /* silent */ } finally { setUpdating(false); setRoleConfirm(null); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await userService.deleteUser(deleteConfirm.id);
      if (res.success) setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
    } catch { /* silent */ } finally { setDeleting(false); setDeleteConfirm(null); }
  };

  const detailRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.customers.title')}</h2>
        <div className="relative">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.customers.searchPlaceholder')}
            className="bg-white/5 border border-white/10 rounded-full py-2 px-8 text-xs focus:outline-none focus:border-ayers-gold transition-all w-full sm:w-48" />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={12} />
        </div>
      </div>
      <Card>
        {loading ? <Spinner /> : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/30 uppercase tracking-widest">{t('admin.customers.noUsers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="px-5 py-4">{t('admin.customers.user')}</th>
                  <th className="px-5 py-4">{t('admin.customers.email')}</th>
                  <th className="px-5 py-4">{t('admin.customers.role')}</th>
                  <th className="px-5 py-4">{t('admin.customers.provider')}</th>
                  <th className="px-5 py-4">{t('admin.customers.joined')}</th>
                  <th className="px-5 py-4">{t('admin.customers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-ayers-gold/10 flex items-center justify-center text-ayers-gold text-xs font-bold">
                            {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                          </div>
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-xs">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', u.role === 'ADMIN' ? 'bg-ayers-gold/10 text-ayers-gold' : 'bg-white/5 text-white/40')}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs capitalize">{u.provider || 'local'}</td>
                      <td className="px-5 py-4 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewUser(u)} className="text-white/30 hover:text-ayers-gold transition-colors" title={t('admin.customers.viewDetails')}><Eye size={14} /></button>
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setRoleConfirm({ user: u, newRole: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                                className={cn('text-white/30 transition-colors', u.role === 'ADMIN' ? 'hover:text-red-400' : 'hover:text-ayers-gold')}
                                title={u.role === 'ADMIN' ? t('admin.customers.demoteToUser') : t('admin.customers.promoteToAdmin')}
                              >
                                {u.role === 'ADMIN' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                              </button>
                              <button onClick={() => setDeleteConfirm(u)} className="text-white/30 hover:text-red-400 transition-colors" title={t('admin.customers.deleteUser')}><Trash2 size={14} /></button>
                            </>
                          )}
                          {isSelf && <span className="text-[10px] text-white/20 italic">{t('admin.customers.you')}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {viewUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{t('admin.customers.userDetails')}</h3>
              <button onClick={() => setViewUser(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-ayers-gold/10 flex items-center justify-center text-ayers-gold text-xl font-bold">
                {(viewUser.firstName?.[0] || viewUser.email[0]).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold">{viewUser.firstName} {viewUser.lastName}</p>
                <p className="text-xs text-white/40">{viewUser.email}</p>
              </div>
            </div>
            <div className="space-y-0">
              {detailRow(t('admin.customers.role'), <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest', viewUser.role === 'ADMIN' ? 'bg-ayers-gold/10 text-ayers-gold' : 'bg-white/5 text-white/40')}>{viewUser.role}</span>)}
              {detailRow(t('admin.customers.provider'), <span className="capitalize">{viewUser.provider || 'local'}</span>)}
              {detailRow(t('admin.customers.phone'), viewUser.phone || <span className="text-white/20 italic">{t('admin.customers.noPhone')}</span>)}
              {detailRow(t('admin.customers.joined'), new Date(viewUser.createdAt).toLocaleDateString())}
              {detailRow('ID', <span className="font-mono text-xs text-white/40">{viewUser.id}</span>)}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewUser(null)} className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">{t('admin.customers.close')}</button>
            </div>
          </motion.div>
        </div>
      )}

      {roleConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !updating && setRoleConfirm(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', roleConfirm.newRole === 'ADMIN' ? 'bg-ayers-gold/10' : 'bg-red-500/10')}>
                {roleConfirm.newRole === 'ADMIN' ? <ChevronUp className="text-ayers-gold" size={20} /> : <ChevronDown className="text-red-400" size={20} />}
              </div>
              <h3 className="text-lg font-bold">{roleConfirm.newRole === 'ADMIN' ? t('admin.customers.promoteToAdmin') : t('admin.customers.demoteToUser')}</h3>
            </div>
            <p className="text-sm text-white/60 mb-6">
              {t('admin.customers.roleChangeConfirm', { action: roleConfirm.newRole === 'ADMIN' ? t('admin.customers.promote').toLowerCase() : t('admin.customers.demote').toLowerCase(), name: `${roleConfirm.user.firstName} ${roleConfirm.user.lastName}`, email: roleConfirm.user.email, role: roleConfirm.newRole })}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRoleConfirm(null)} disabled={updating} className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">{t('admin.customers.cancel')}</button>
              <button onClick={handleRoleChange} disabled={updating}
                className={cn('px-4 py-2 text-xs uppercase tracking-widest rounded-full font-bold transition-all', roleConfirm.newRole === 'ADMIN' ? 'bg-ayers-gold text-black hover:bg-ayers-gold/80' : 'bg-red-500 text-white hover:bg-red-600', updating && 'opacity-50 cursor-not-allowed')}>
                {updating ? t('admin.customers.updating') : t('admin.customers.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeleteConfirm(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2a1f14] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><AlertTriangle className="text-red-400" size={20} /></div>
              <h3 className="text-lg font-bold">{t('admin.customers.deleteUser')}</h3>
            </div>
            <p className="text-sm text-white/60 mb-6">{t('admin.customers.deleteConfirm', { name: `${deleteConfirm.firstName} ${deleteConfirm.lastName}`, email: deleteConfirm.email })}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="px-4 py-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">{t('admin.customers.cancel')}</button>
              <button onClick={handleDelete} disabled={deleting}
                className={cn('px-4 py-2 text-xs uppercase tracking-widest rounded-full font-bold transition-all bg-red-500 text-white hover:bg-red-600', deleting && 'opacity-50 cursor-not-allowed')}>
                {deleting ? t('admin.customers.deleting') : t('admin.customers.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
