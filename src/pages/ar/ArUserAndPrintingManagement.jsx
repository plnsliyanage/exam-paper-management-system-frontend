import React, { useState, useEffect } from 'react';
import { arApi } from '../../services/api';
import { UserPlus, Printer, Calendar, Check, Shield } from 'lucide-react';

export default function ArUserAndPrintingManagement({ arUserId = 'AR001' }) {
  const [approvedPackets, setApprovedPackets] = useState([]);
  
  // New User Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('LECTURER');

  // Printing Schedule Form State
  const [selectedPacket, setSelectedPacket] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  useEffect(() => {
    arApi.getApprovedForPrinting()
      .then((res) => setApprovedPackets(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await arApi.createUser({ username, email, role }, arUserId);
      alert('User created successfully!');
      setUsername('');
      setEmail('');
    } catch (err) {
      alert('Failed to create user account.');
    }
  };

  const handleSchedulePrinting = async (e) => {
    e.preventDefault();
    if (!selectedPacket || !timeSlot) return;

    try {
      await arApi.schedulePrinting({ packetId: selectedPacket, scheduledTimeSlot: timeSlot }, arUserId);
      alert('Printing slot assigned!');
      setSelectedPacket('');
      setTimeSlot('');
    } catch (err) {
      alert('Failed to schedule printing.');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administration & Printing Controls</h1>
        <p className="text-sm text-slate-500">Create system accounts and dispatch exam packets to printing slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Creation Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
            <UserPlus className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-slate-800">Register New Staff User</h2>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Username / ID</label>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. j_doe"
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="j.doe@university.edu"
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role Permission</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="LECTURER">Lecturer</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="AR">Assistant Registrar (AR)</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Schedule Printing Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
            <Printer className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800">Schedule Printing Activity</h2>
          </div>

          <form onSubmit={handleSchedulePrinting} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Approved Exam Packet</label>
              <select 
                value={selectedPacket} 
                onChange={(e) => setSelectedPacket(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Select Packet --</option>
                {approvedPackets.map((pkt) => (
                  <option key={pkt.id} value={pkt.id}>
                    {pkt.courseCode} - {pkt.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Printing Time Slot</label>
              <input 
                type="datetime-local" 
                required 
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
            >
              Confirm Schedule Slot
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}