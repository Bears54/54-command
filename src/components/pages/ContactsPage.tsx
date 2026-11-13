import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Trash2,
  X,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { ContactItem } from '../../types/binder';

export const ContactsPage: React.FC = () => {
  const { contacts, addContact, deleteContact, celebrate } = useBinder();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelation, setSelectedRelation] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState<ContactItem['relation']>('Friend');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');

  const relations = ['All', 'Family', 'Friend', 'Work', 'Professional', 'Services'];

  const filteredContacts = contacts.filter((c) => {
    const matchesRelation = selectedRelation === 'All' || c.relation === selectedRelation;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRelation && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addContact({
      name: name.trim(),
      relation,
      phone: phone.trim(),
      email: email.trim(),
      birthday: birthday || undefined,
      notes: notes.trim() || undefined,
    });
    setName('');
    setPhone('');
    setEmail('');
    setBirthday('');
    setNotes('');
    setIsAddOpen(false);
    celebrate();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
            Personal Directory &amp; Important Contacts
          </h2>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
            Key phone numbers, medical professionals, emergency contacts, and family birthdays
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-xl overflow-x-auto">
          {relations.map((rel) => (
            <button
              key={rel}
              onClick={() => setSelectedRelation(rel)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedRelation === rel
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.4)] font-bold'
                  : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              {rel}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="hud-panel hud-corners washi-tape-top p-4 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-start justify-between pb-2.5 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#be7fab] to-[#daabcb] border border-[#efd0e5]/50 flex items-center justify-center font-bold text-xs text-[#120a10]">
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug">
                      {contact.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#be7fab]/20 px-2 py-0.5 rounded-full border border-[#d29ec2] dark:border-[#be7fab]/40">
                      {contact.relation}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteContact(contact.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/70 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-opacity"
                  title="Delete contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-[#2d1b28]/85 dark:text-[#e6c3db]">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
                    <span>{contact.phone}</span>
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-colors truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact.birthday && (
                  <div className="flex items-center gap-2 text-[#2d1b28] dark:text-[#efd0e5]">
                    <Calendar className="w-3.5 h-3.5 text-[#be7fab] shrink-0" />
                    <span>Birthday: {contact.birthday}</span>
                  </div>
                )}
              </div>

              {contact.notes && (
                <div className="mt-3 p-2 rounded-lg bg-[#e6c3db]/55 dark:bg-[#120a10]/75 border border-[#d29ec2]/50 dark:border-[#be7fab]/20 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 italic leading-snug">
                  {contact.notes}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20 flex items-center justify-between text-[11px] text-[#2d1b28]/65 dark:text-[#d29ec2]/75">
              <span>Directory contact</span>
              <a href={`tel:${contact.phone}`} className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] font-semibold">
                Call / Message →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Add Directory Contact
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Allison Montgomery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Relation
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as ContactItem['relation'])}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Work">Work</option>
                    <option value="Professional">Professional</option>
                    <option value="Services">Services</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 012-3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Birthday (Optional)
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Special preferences, office hours, address..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
