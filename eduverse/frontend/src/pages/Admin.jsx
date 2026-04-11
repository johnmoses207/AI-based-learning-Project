import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function Admin() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [resources, setResources] = useState([]);
    const [agents, setAgents] = useState([]);

    // View State
    const [view, setView] = useState('users'); // 'users', 'analytics', 'resources', 'agents'

    // Resource Form State
    const [newResource, setNewResource] = useState({ title: '', type: 'article', link: '', category: 'AI', description: '' });

    // Agent Editing State
    const [editingAgent, setEditingAgent] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchAnalytics();
        fetchResources();
        fetchAgents();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/admin/analytics");
            setAnalytics(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const fetchResources = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/admin/resources");
            setResources(res.data);
        } catch (err) {
            console.error("Failed to fetch resources", err);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/admin/agents");
            setAgents(res.data);
        } catch (err) {
            console.error("Failed to fetch agents", err);
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/admin/resources", newResource);
            fetchResources();
            setNewResource({ title: '', type: 'article', link: '', category: 'AI', description: '' });
            alert("Resource Added!");
        } catch (err) {
            alert("Failed to add resource");
        }
    };

    const handleDeleteResource = async (id) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/resources/${id}`);
            fetchResources();
        } catch (err) {
            alert("Failed to delete resource");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/users/${id}`);
            fetchUsers();
            fetchAnalytics(); // Update stats
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleRoleToggle = async (user) => {
        const newRole = user.role === 'admin' ? 'student' : 'admin';
        if (!window.confirm(`Change role to ${newRole}?`)) return;
        try {
            await axios.put(`http://localhost:8000/api/admin/users/${user.id}/role?role=${newRole}`);
            fetchUsers();
            fetchAnalytics(); // Update stats
        } catch (err) {
            alert("Failed to update role");
        }
    };

    const handleSaveAgent = async (e) => {
        e.preventDefault();
        if (!editingAgent) return;
        try {
            await axios.put(`http://localhost:8000/api/admin/agents/${editingAgent.id}`, {
                system_prompt: editingAgent.system_prompt,
                temperature: parseFloat(editingAgent.temperature)
            });
            alert("Agent updated successfully!");
            setEditingAgent(null);
            fetchAgents();
        } catch (err) {
            alert("Failed to update agent");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3">
                    <span className="text-4xl">🛡️</span> Admin Console
                </h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
                >
                    Back to Dashboard
                </button>
            </header>

            {/* View Toggle */}
            <div className="flex flex-wrap gap-4 mb-8">
                {[
                    { id: 'users', label: 'Manage Users' },
                    { id: 'analytics', label: 'System Analytics' },
                    { id: 'resources', label: 'Manage Content' },
                    { id: 'agents', label: 'Agent Studio' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === tab.id ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {view === 'users' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Summary Cards (using users array directly) */}
                        <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 mb-2">Total Students</h3>
                            <p className="text-4xl font-bold">{users.filter(u => u.role !== 'admin').length}</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 mb-2">Admins</h3>
                            <p className="text-4xl font-bold text-green-400">{users.filter(u => u.role === 'admin').length}</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                            <h3 className="text-gray-400 mb-2">Total Users</h3>
                            <p className="text-4xl font-bold text-indigo-400">{users.length}</p>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-gray-800/50">
                            <h2 className="text-xl font-bold">User Management</h2>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Goal & Progress</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                    {user.avatar ?
                                                        <img src={user.avatar} className="w-8 h-8 rounded-full border border-white/10" />
                                                        : <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-xs">{user.email[0].toUpperCase()}</div>
                                                    }
                                                    <div className="flex flex-col">
                                                        <span>{user.email}</span>
                                                        <span className="text-xs text-gray-500">ID: #{user.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleRoleToggle(user)}
                                                        className={`px-2 py-1 rounded text-xs border cursor-pointer hover:opacity-80 ${user.role === 'admin'
                                                            ? 'bg-red-900/20 text-red-400 border-red-500/30'
                                                            : 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30'
                                                            }`}>
                                                        {user.role} 🖊️
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.goal ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm text-white font-medium">{user.goal}</span>
                                                            <span className="text-xs text-indigo-300">{user.skill} | {user.style}</span>
                                                            <span className="text-xs text-green-400">{user.hours || 0} hrs</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-600 italic">No goal set</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {view === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Charts */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold mb-6">Skill Level Distribution</h3>
                        <div className="h-64">
                            {analytics && analytics.skill_distribution ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.skill_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {analytics.skill_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <p className="text-gray-500 text-center py-10">No data available or loading...</p>}
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold mb-6">Learning Hours Distribution</h3>
                        <div className="h-64">
                            {analytics && analytics.hours_distribution ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.hours_distribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                                        <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p className="text-gray-500 text-center py-10">No data available or loading...</p>}
                        </div>
                    </div>
                </div>
            )}

            {view === 'resources' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add Resource Form */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold mb-6">Add New Learning Material</h2>
                        <form onSubmit={handleAddResource} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-800 border-none rounded p-2 text-white"
                                    value={newResource.title}
                                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Type</label>
                                    <select
                                        className="w-full bg-gray-800 border-none rounded p-2 text-white"
                                        value={newResource.type}
                                        onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                                    >
                                        <option value="article">Article</option>
                                        <option value="video">Video</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="course">Course</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Category</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-800 border-none rounded p-2 text-white"
                                        value={newResource.category}
                                        onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Link URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full bg-gray-800 border-none rounded p-2 text-white"
                                    value={newResource.link}
                                    onChange={e => setNewResource({ ...newResource, link: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Description</label>
                                <textarea
                                    className="w-full bg-gray-800 border-none rounded p-2 text-white h-24"
                                    value={newResource.description}
                                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 py-2 rounded font-bold transition-colors">
                                Add Resource
                            </button>
                        </form>
                    </div>

                    {/* Resources List */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold mb-6">Existing Resources ({resources.length})</h2>
                        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {resources.map(r => (
                                <div key={r.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center group">
                                    <div>
                                        <h4 className="font-bold text-white">{r.title}</h4>
                                        <div className="flex gap-2 text-xs mt-1">
                                            <span className="bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded uppercase">{r.type}</span>
                                            <span className="text-gray-400">{r.category}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteResource(r.id)}
                                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {resources.length === 0 && <p className="text-gray-500 text-center py-10">No resources added yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {view === 'agents' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Agent List */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold mb-6">Active Agents</h2>
                        <div className="space-y-4">
                            {agents.map(agent => (
                                <div
                                    key={agent.id}
                                    onClick={() => setEditingAgent(agent)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${editingAgent?.id === agent.id
                                            ? 'bg-indigo-900/20 border-indigo-500'
                                            : 'bg-gray-800 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-lg text-indigo-300">{agent.agent_name}</h3>
                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Temp: {agent.temperature}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-3 font-mono bg-black/30 p-2 rounded">
                                        {agent.system_prompt}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Editor */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-white/5 flex flex-col h-full">
                        <h2 className="text-xl font-bold mb-6">Agent Configuration</h2>
                        {editingAgent ? (
                            <form onSubmit={handleSaveAgent} className="flex flex-col gap-6 flex-1">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Agent Name</label>
                                    <input
                                        type="text"
                                        value={editingAgent.agent_name}
                                        disabled
                                        className="w-full bg-gray-800 border-none rounded p-3 text-gray-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <label className="text-sm text-gray-400 block mb-2">System Prompt (The Brain)</label>
                                    <textarea
                                        className="w-full bg-gray-800 border border-white/10 rounded-xl p-4 text-white font-mono text-sm leading-relaxed flex-1 focus:border-indigo-500 focus:outline-none resize-none"
                                        value={editingAgent.system_prompt}
                                        onChange={e => setEditingAgent({ ...editingAgent, system_prompt: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        This prompt defines the agent's personality, rules, and output format.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Temperature (Creativity: 0.0 - 1.0)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={editingAgent.temperature}
                                            onChange={e => setEditingAgent({ ...editingAgent, temperature: e.target.value })}
                                            className="flex-1"
                                        />
                                        <span className="bg-gray-800 px-3 py-1 rounded text-sm w-16 text-center">{editingAgent.temperature}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setEditingAgent(null)}
                                        className="px-6 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                    >
                                        Save Configuration
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <span className="text-6xl mb-4 opacity-20">🤖</span>
                                <p>Select an agent from the left to edit its brain.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
