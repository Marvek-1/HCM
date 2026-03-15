import { useState, useMemo } from 'react';
import '../styles/Dashboard.css';
import '../styles/modern-ui.css';
import { Download, Plus, Package, TrendingUp, ShoppingCart, AlertTriangle, DollarSign, BarChart2, MoreHorizontal, ArrowRight, Monitor, Headphones, Smartphone, Watch, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const lineData = [
  { name: 'Mon', orders: 45, fulfilled: 30 },
  { name: 'Tue', orders: 52, fulfilled: 42 },
  { name: 'Wed', orders: 38, fulfilled: 35 },
  { name: 'Thu', orders: 65, fulfilled: 50 },
  { name: 'Fri', orders: 48, fulfilled: 40 },
  { name: 'Sat', orders: 30, fulfilled: 25 },
  { name: 'Sun', orders: 40, fulfilled: 38 },
];

const donutData = [
  { name: 'Medical Kits', value: 45, color: '#005eb8' },
  { name: 'PPE', value: 25, color: '#60a5fa' },
  { name: 'Cold Chain', value: 20, color: '#c084fc' },
  { name: 'Laboratory', value: 10, color: '#e2e8f0' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-[8px_8px_16px_#e6e9ef,-8px_-8px_16px_#ffffff] border border-white">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
function Dashboard({ stats, role, orders, onViewOrder, currentUser }) {
  return (
    <>
      <div className="w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of your eProduct activity</p>
          </div>
          <div className="flex gap-3">
            <button className="neu-pressed px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:text-[#005eb8] transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="bg-[#005eb8] text-white px-4 py-2 rounded-lg text-sm font-medium neu-btn-primary flex items-center gap-2 hover:bg-[#004a94] transition-colors">
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <div className="neu-flat rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
                <h3 className="text-3xl font-bold text-gray-800">1,248</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#005eb8]">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 flex items-center font-medium"><TrendingUp className="w-3 h-3 mr-1" /> +12%</span>
              <span className="text-gray-400 ml-2">from last month</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="neu-flat rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Orders</p>
                <h3 className="text-3xl font-bold text-gray-800">86</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 flex items-center font-medium"><TrendingUp className="w-3 h-3 mr-1" /> +5%</span>
              <span className="text-gray-400 ml-2">from last month</span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="neu-flat rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Low Stock Alerts</p>
                <h3 className="text-3xl font-bold text-gray-800">24</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-500 flex items-center font-medium"><TrendingUp className="w-3 h-3 mr-1" /> +8</span>
              <span className="text-gray-400 ml-2">new since yesterday</span>
            </div>
          </div>

          {/* Stat Card 4 */}
          <div className="neu-flat rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Value</p>
                <h3 className="text-3xl font-bold text-gray-800">$4.2M</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 flex items-center font-medium"><TrendingUp className="w-3 h-3 mr-1" /> +18%</span>
              <span className="text-gray-400 ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 neu-flat rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#005eb8]" /> Order Fulfillment Trends
              </h3>
              <select className="bg-gray-50 border border-[#e6e9ef] text-sm rounded-lg shadow-inner focus:ring-[#005eb8] focus:border-[#005eb8] block p-2 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#005eb8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#005eb8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFulfilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="orders" name="Total Orders" stroke="#005eb8" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" activeDot={{ r: 6, strokeWidth: 0, fill: '#005eb8' }} />
                  <Area type="monotone" dataKey="fulfilled" name="Fulfilled" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorFulfilled)" activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart */}
          <div className="neu-flat rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800 text-lg">Product Categories</h3>
              <button className="text-gray-400 hover:text-[#005eb8] transition-colors neu-pressed p-1 rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(2px 4px 6px ${entry.color}40)` }} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-gray-800">100%</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Allocated</span>
                </div>
              </div>
              
              <div className="mt-8 w-full grid grid-cols-2 gap-y-4 gap-x-2">
                {donutData.map((item, index) => (
                  <div key={index} className="flex flex-col items-start bg-gray-50/50 p-2 rounded-xl shadow-inner">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-500 font-semibold truncate w-full">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800 pl-5">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="neu-flat rounded-2xl overflow-hidden mt-6">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">Recent Events & Orders</h3>
            <button className="text-sm font-bold text-[#005eb8] hover:text-[#004a94] flex items-center gap-1 transition-colors neu-pressed px-4 py-2 rounded-lg">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto p-4">
            <div className="space-y-4">
              {[
                { id: 'ORD-7943', name: 'IEHK 2017 Kit', date: 'Oct 24, 2023', amt: '$2,499.00', status: 'Completed', color: 'green', icon: Package },
                { id: 'ORD-7942', name: 'Oxygen Concentrator', date: 'Oct 23, 2023', amt: '$549.00', status: 'Processing', color: 'blue', icon: Activity },
                { id: 'EVT-1002', name: 'Low Stock: Amoxicillin', date: 'Oct 22, 2023', amt: '-', status: 'Alert', color: 'orange', icon: AlertTriangle },
                { id: 'ORD-7940', name: 'Cold Box Aucma', date: 'Oct 20, 2023', amt: '$799.00', status: 'Completed', color: 'green', icon: Package },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-[4px_4px_10px_#e6e9ef,-4px_-4px_10px_#ffffff] border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${row.color === 'green' ? 'bg-green-100 text-green-600' : row.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      <row.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-[#005eb8] transition-colors">{row.name}</h4>
                      <p className="text-sm font-medium text-gray-500">{row.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-gray-800">{row.amt}</span>
                    <span className="text-xs text-gray-400 font-medium">{row.date}</span>
                  </div>
                  <div className="w-24 flex justify-end">
                    <span className={`px-3 py-1 font-bold text-xs rounded-full shadow-sm ${
                      row.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                      row.status === 'Processing' ? 'bg-blue-100 text-[#005eb8] border border-blue-200' :
                      'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="w-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="neu-pressed p-2 rounded-lg text-gray-400 hover:text-[#005eb8]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
