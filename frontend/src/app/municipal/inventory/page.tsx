'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  IndianRupee, 
  ArrowUpDown,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface Material {
  _id: string;
  name: string;
  costPerTon: number;
  availableQuantity: number;
  description: string;
  unit: string;
}

export default function InventoryPage() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const API = (envApi && envApi !== '/') ? envApi : 'http://localhost:5000';
  const { firebaseToken: token } = useAuthStore();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    costPerTon: 0,
    availableQuantity: 0,
    description: ''
  });

  const fetchInventory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/municipal/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingMaterial ? 'PATCH' : 'POST';
    const url = editingMaterial ? `${API}/api/municipal/inventory/${editingMaterial._id}` : `${API}/api/municipal/inventory`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingMaterial(null);
        setFormData({ name: '', costPerTon: 0, availableQuantity: 0, description: '' });
        fetchInventory();
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      const res = await fetch(`${API}/api/municipal/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchInventory();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      costPerTon: material.costPerTon,
      availableQuantity: material.availableQuantity,
      description: material.description
    });
    setIsModalOpen(true);
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materials, searchTerm]);

  const stats = useMemo(() => {
    const totalItems = materials.length;
    const lowStock = materials.filter(m => m.availableQuantity < 500).length;
    const totalValue = materials.reduce((acc, m) => acc + (m.costPerTon * m.availableQuantity), 0);
    return { totalItems, lowStock, totalValue };
  }, [materials]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex flex-col gap-2">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Materials</p>
           <div className="flex items-end justify-between">
              <p className="text-4xl font-black text-brand-primary tracking-tighter">{stats.totalItems.toString().padStart(2, '0')}</p>
              <Package className="w-8 h-8 text-brand-primary opacity-20" />
           </div>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex flex-col gap-2">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock Alert</p>
           <div className="flex items-end justify-between">
              <p className={cn("text-4xl font-black tracking-tighter", stats.lowStock > 0 ? "text-red-500" : "text-brand-primary")}>
                {stats.lowStock.toString().padStart(2, '0')}
              </p>
              <AlertTriangle className={cn("w-8 h-8 opacity-20", stats.lowStock > 0 ? "text-red-500" : "text-brand-primary")} />
           </div>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex flex-col gap-2">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Value</p>
           <div className="flex items-end justify-between">
              <p className="text-4xl font-black text-brand-primary tracking-tighter">₹{(stats.totalValue / 1000).toFixed(1)}k</p>
              <IndianRupee className="w-8 h-8 text-brand-primary opacity-20" />
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E5E1D8] py-4 pl-12 pr-6 text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none"
          />
        </div>
        <button 
          onClick={() => { setEditingMaterial(null); setFormData({ name: '', costPerTon: 0, availableQuantity: 0, description: '' }); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-brand-primary text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-lg shadow-brand-primary/10"
        >
          <Plus className="w-4 h-4" />
          Add New Material
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9F7F2] border-b border-[#E5E1D8] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-10 py-6">Material</th>
                <th className="px-8 py-6 text-center">In Stock (kg)</th>
                <th className="px-8 py-6 text-center">Cost / kg</th>
                <th className="px-8 py-6">Last Update</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredMaterials.map((material) => (
                <tr key={material._id} className="group hover:bg-[#F9F7F2] transition-colors">
                  <td className="px-10 py-8">
                    <p className="font-black text-brand-primary text-sm uppercase">{material.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 line-clamp-1">{material.description}</p>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <span className={cn(
                      "px-4 py-2 text-[10px] font-black tracking-widest border",
                      material.availableQuantity < 500 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                    )}>
                      {material.availableQuantity}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-center font-black text-brand-primary">₹{material.costPerTon}</td>
                  <td className="px-8 py-8 text-xs font-bold text-gray-400">
                    Today
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(material)}
                        className="p-2 text-brand-primary hover:bg-brand-primary hover:text-white transition-all border border-[#E5E1D8]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(material._id)}
                        className="p-2 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-[#E5E1D8]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">
                    No inventory records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-primary/20 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg border border-[#E5E1D8] shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-brand-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-10 space-y-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Management</p>
                <h3 className="text-3xl font-black text-brand-primary uppercase tracking-tighter">
                  {editingMaterial ? 'Update Resource' : 'Register Resource'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Material Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Industrial Plastic"
                    className="w-full bg-[#F9F7F2] border border-[#E5E1D8] py-4 px-6 text-sm font-bold text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cost / kg (₹)</label>
                    <input 
                      required
                      type="number"
                      value={formData.costPerTon}
                      onChange={(e) => setFormData({...formData, costPerTon: Number(e.target.value)})}
                      className="w-full bg-[#F9F7F2] border border-[#E5E1D8] py-4 px-6 text-sm font-bold text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity (kg)</label>
                    <input 
                      required
                      type="number"
                      value={formData.availableQuantity}
                      onChange={(e) => setFormData({...formData, availableQuantity: Number(e.target.value)})}
                      className="w-full bg-[#F9F7F2] border border-[#E5E1D8] py-4 px-6 text-sm font-bold text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#F9F7F2] border border-[#E5E1D8] py-4 px-6 text-sm font-bold text-brand-primary outline-none focus:ring-1 focus:ring-brand-primary h-24"
                    placeholder="Provide details about the material grade or sourcing..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-primary text-white py-5 text-[12px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20"
                >
                  {editingMaterial ? 'Confirm Updates' : 'Add to Inventory'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
