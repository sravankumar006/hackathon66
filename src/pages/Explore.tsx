import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Database, 
  Cpu, 
  Layers, 
  Network,
  X,
  Server,
  Terminal,
  HelpCircle,
  Plus
} from 'lucide-react';

interface ResourceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Database' | 'Compute' | 'Storage' | 'Network';
  status: string;
  cores: number;
  memory: string;
  region: string;
  cost: string;
}

export const Explore: React.FC = () => {
  const [resources, setResources] = useState<ResourceTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<ResourceTemplate | null>(null);

  const categories = ['All', 'Compute', 'Database', 'Storage', 'Network'];

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database': return Database;
      case 'Compute': return Cpu;
      case 'Storage': return Layers;
      case 'Network': return Network;
      default: return Server;
    }
  };

  const handleAddTemplatePlaceholder = () => {
    // Allows user to test adding a generic template out of the box
    const newId = crypto.randomUUID();
    const newTemplate: ResourceTemplate = {
      id: newId,
      name: `Generic Template ${resources.length + 1}`,
      description: 'Modify this template description in the code based on your problem statement later.',
      category: 'Compute',
      status: 'Available',
      cores: 1,
      memory: '2 GB',
      region: 'us-east-1',
      cost: '$10/mo'
    };
    setResources(prev => [...prev, newTemplate]);
  };

  return (
    <div className="relative space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Explore
          </h1>
          <p className="text-slate-400 text-sm">
            Search, inspect, and select operational resources.
          </p>
        </div>

        {/* Search Input bar */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-200 text-xs placeholder-slate-550 transition outline-none"
          />
        </div>
      </div>

      {/* Category Pills & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition ${
                activeCategory === category
                  ? 'bg-indigo-600 border-indigo-650 text-indigo-50 shadow-md'
                  : 'bg-slate-900 border-slate-850 text-slate-450 hover:border-slate-800 hover:text-slate-250'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleAddTemplatePlaceholder}
          className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-indigo-50 text-xs font-semibold rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Placeholder</span>
        </button>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => {
          const IconComponent = getCategoryIcon(res.category);
          return (
            <div
              key={res.id}
              onClick={() => setSelectedItem(res)}
              className={`p-5 bg-slate-900 border ${
                selectedItem?.id === res.id ? 'border-indigo-550' : 'border-slate-850'
              } hover:border-slate-750 rounded-xl cursor-pointer flex flex-col justify-between h-[180px] transition text-left relative group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                    <IconComponent className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {res.category}
                    </span>
                  </div>
                  
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-500/5 text-slate-450 border-slate-850">
                    {res.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition mb-1.5">
                  {res.name}
                </h3>
                
                <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 font-bold border-t border-slate-850/60 pt-3">
                <span>{res.cores} Cores / {res.memory}</span>
                <span className="text-slate-350">{res.cost}</span>
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full py-16 bg-slate-900 border border-slate-850 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-500">
            <HelpCircle className="w-10 h-10 text-slate-650 mb-3" />
            <p className="text-xs font-semibold">No templates found.</p>
            <p className="text-[10px] text-slate-600 mt-1">Click "Add Placeholder" above or bind templates to test.</p>
          </div>
        )}
      </div>

      {/* Drawer: Detailed view (Slide in from Right) */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 z-50 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-350 uppercase tracking-widest">Specifications</span>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-1 rounded-md bg-slate-950 border border-slate-850 text-slate-450 hover:text-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Resource Info */}
                <div className="space-y-6 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 py-0.5 rounded bg-slate-950 border border-slate-850">
                      {selectedItem.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-100 mt-3 mb-2">{selectedItem.name}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{selectedItem.description}</p>
                  </div>

                  {/* Hardware Specs Table */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Specifications</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">CPU Cores</span>
                        <span className="font-semibold text-slate-200">{selectedItem.cores} Cores</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Memory</span>
                        <span className="font-semibold text-slate-200">{selectedItem.memory}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Region</span>
                        <span className="font-semibold text-slate-200">{selectedItem.region.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Cost</span>
                        <span className="font-semibold text-slate-200">{selectedItem.cost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
