import { motion } from 'motion/react';
import { User, Mail, Phone, Shield, Settings, Activity, Calendar, Users, BarChart3 } from 'lucide-react';
import { User as UserType } from '../../data/mockData';

interface AdminProfilePageProps {
    user: UserType;
}

export function AdminProfilePage({ user }: AdminProfilePageProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 px-6 pt-6 bg-transparent min-h-screen text-zinc-300">

            {/* Header */}
            <div className="space-y-1 border-b border-zinc-900 pb-10">
                <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-2 font-bold">
                    <Shield className="w-3 h-3 animate-pulse" /> Administrator_Console
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                    MY <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">PROFILE</span>
                </h1>
                <p className="text-zinc-500 text-sm font-medium">Manage your administrator account settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column — Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900/30 border border-amber-500/20 rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-10 h-1 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 mx-auto mb-6 overflow-hidden shadow-xl shadow-amber-500/20">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-14 h-14 text-black" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{user.name}</h2>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-2">{user.email}</p>

                        <div className="mt-6 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Admin</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(251, 183, 3, 0.2)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-amber-400 to-orange-600 text-black font-black uppercase italic tracking-tighter rounded-2xl flex items-center justify-center gap-2"
                        >
                            <Settings className="w-4 h-4" /> Edit Profile
                        </motion.button>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-6 space-y-4">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Contact</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-sm font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-sm font-medium">+91 98765 43210</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column — Admin-specific info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Admin Overview Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 rounded-[2rem] overflow-hidden">
                        {[
                            { label: 'Role', value: 'Admin', icon: Shield, color: 'text-amber-400' },
                            { label: 'Events Managed', value: '—', icon: Calendar, color: 'text-violet-400' },
                            { label: 'Teams Overseen', value: '—', icon: Users, color: 'text-emerald-400' },
                            { label: 'System Status', value: 'Active', icon: Activity, color: 'text-sky-400' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#050505] p-6 group hover:bg-zinc-900/20 transition-all">
                                <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-2xl font-black text-white tracking-tighter`}>{stat.value}</span>
                                    <stat.icon className={`w-4 h-4 ${stat.color} opacity-30`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Account Details */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Account Details</h3>
                            <BarChart3 className="w-5 h-5 text-zinc-700" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Full Name</label>
                                <div className="px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium">{user.name}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Email</label>
                                <div className="px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-medium">{user.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Role</label>
                                <div className="px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 text-sm font-bold uppercase tracking-wider">Administrator</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Account Status</label>
                                <div className="px-5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified &amp; Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Security</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, borderColor: 'rgba(251, 183, 3, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-left transition-all"
                            >
                                <p className="text-white font-bold text-sm mb-1">Change Password</p>
                                <p className="text-zinc-500 text-xs">Update your authentication credentials</p>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, borderColor: 'rgba(251, 183, 3, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-left transition-all"
                            >
                                <p className="text-white font-bold text-sm mb-1">Active Sessions</p>
                                <p className="text-zinc-500 text-xs">Manage logged-in devices and tokens</p>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
